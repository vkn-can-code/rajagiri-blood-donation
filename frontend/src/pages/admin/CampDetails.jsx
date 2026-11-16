// This file is src/pages/admin/CampDetails.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  getCampById, 
  getCampDonations, 
  updateCamp,
  getCampRegistrations,
  updateRegistrationStatus
} from '../../services/adminService';
import styles from './CampDetails.module.css';
import Spinner from '../common/Spinner';

// --- Main Component ---
const CampDetails = () => {
  const { id: campId } = useParams(); // Get camp ID from URL
  const navigate = useNavigate();
  const [camp, setCamp] = useState(null);
  const [donations, setDonations] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' or 'donations'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [campDate, setCampDate] = useState('');
  const [gmapsLink, setGmapsLink] = useState('');

  // Fetch all camp data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [campData, donationsData, registrationsData] = await Promise.all([
        getCampById(campId),
        getCampDonations(campId),
        getCampRegistrations(campId)
      ]);

      // Pre-fill state with fetched data
      setCamp(campData);
      setDonations(donationsData);
      setRegistrations(registrationsData);
      setTitle(campData.title);
      setLocation(campData.location);
      setAddress(campData.address || '');
      setGmapsLink(campData.google_maps_link || '');
      // Format date for datetime-local input
      const date = new Date(campData.camp_date);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      setCampDate(date.toISOString().slice(0, 16));

    } catch (err) {
      setError(err.toString());
    } finally {
      setIsLoading(false);
    }
  }, [campId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Form Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const campData = { 
        title, 
        location, 
        address, 
        camp_date: campDate,
        google_maps_link: gmapsLink
      };
      
      const result = await updateCamp(campId, campData);
      setMessage(result.message || 'Camp updated successfully!');
      setCamp(result.camp); // Update state with new camp data
    } catch (err) {
      setError(err.toString());
    }
  };

  const handleUpdateStatus = async (regId, status) => {
    try {
      await updateRegistrationStatus(campId, regId, status);
      // Refresh registrations
      const newRegs = await getCampRegistrations(campId);
      setRegistrations(newRegs);
    } catch (err) {
      setError(err.toString());
    }
  };

  if (isLoading) return <Spinner />;
  if (error && !camp) return <p className={styles.messageError}>{error}</p>;
  
  return (
    <div className={styles.pageContainer}>
      <Link to="/admin/camps" className={styles.backLink}>&larr; Back to All Camps</Link>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h1 className={styles.pageTitle}>Camp Details</h1>
        <button
          onClick={() => navigate(`/admin/camps/${campId}/data-entry`)}
          style={{
            background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(211,47,47,0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          📋 Data Entry
        </button>
      </div>

      {message && <div className={styles.messageSuccess}>{message}</div>}
      {error && <div className={styles.messageError}>{error}</div>}

      <div className={styles.layoutGrid}>
        
        {/* --- Column 1: Edit Form --- */}
        <aside className={styles.sidebar}>
          <h3 className={styles.containerTitle}>Edit Camp</h3>
          <form onSubmit={handleUpdate} className={styles.sidebarForm}>
            
            <div className={styles.formGroup}>
              <label htmlFor="title">Camp Title</label>
              <input 
                type="text" 
                id="title" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="location">Venue Name</label>
              <input 
                type="text" 
                id="location" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="campDate">Date & Time</label>
              <input 
                type="datetime-local" 
                id="campDate" 
                value={campDate} 
                onChange={e => setCampDate(e.target.value)} 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address">Full Address</label>
              <textarea 
                id="address" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                rows="2" 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="gmapsLink">Google Maps Link (Optional)</label>
              <input 
                type="url" 
                id="gmapsLink" 
                value={gmapsLink} 
                onChange={e => setGmapsLink(e.target.value)} 
                placeholder="https://maps.app.goo.gl/..." 
              />
            </div>
            
            <button type="submit" className={styles.formButton}>Save Changes</button>
          </form>
        </aside>

        {/* --- Column 2: Participants & Registrations --- */}
        <main className={styles.mainContent}>
          <div className={styles.listContainer}>
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
              <button 
                onClick={() => setActiveTab('registrations')} 
                style={{ background: 'none', border: 'none', padding: '10px', cursor: 'pointer', borderBottom: activeTab === 'registrations' ? '2px solid #d32f2f' : 'none', fontWeight: activeTab === 'registrations' ? 'bold' : 'normal' }}
              >
                Registrations ({registrations.length})
              </button>
              <button 
                onClick={() => setActiveTab('donations')} 
                style={{ background: 'none', border: 'none', padding: '10px', cursor: 'pointer', borderBottom: activeTab === 'donations' ? '2px solid #d32f2f' : 'none', fontWeight: activeTab === 'donations' ? 'bold' : 'normal' }}
              >
                Donations ({donations.length})
              </button>
            </div>

            {activeTab === 'donations' && (
              <div className={styles.tableWrapper}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Participant Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Donation Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{textAlign: 'center'}}>No participants found for this camp.</td>
                      </tr>
                    ) : (
                      donations.map((donation) => (
                        <tr key={donation.id}>
                          <td>{donation.User?.name || 'Unknown User'}</td>
                          <td>{donation.User?.email || '-'}</td>
                          <td>{donation.User?.phone_number || '-'}</td>
                          <td>{new Date(donation.donation_date).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'registrations' && (
              <div className={styles.tableWrapper}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Answers</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{textAlign: 'center'}}>No registrations found.</td>
                      </tr>
                    ) : (
                      registrations.map((reg) => (
                        <tr key={reg.id}>
                          <td>
                            <strong>{reg.User?.name || 'Unknown'}</strong><br/>
                            <small>{reg.User?.email || '-'}</small><br/>
                            <small>{reg.User?.phone_number || '-'}</small>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            Wgt>45: {reg.weight_over_45 ? 'Y' : 'N'} | 
                            Donated: {reg.already_donated ? 'Y' : 'N'} | 
                            Surg: {reg.major_surgery ? 'Y' : 'N'} | 
                            Med: {reg.on_medication ? 'Y' : 'N'}<br/>
                            Tattoo: {reg.tattoo_piercing ? 'Y' : 'N'} | 
                            Alc: {reg.consumed_alcohol ? 'Y' : 'N'} | 
                            Dent: {reg.dental_work ? 'Y' : 'N'} | 
                            Preg/B: {reg.pregnant_breastfeeding ? 'Y' : 'N'} | 
                            Dis: {reg.history_disease ? 'Y' : 'N'}
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                              background: reg.status === 'approved' ? '#dcfce7' : reg.status === 'auto_rejected' ? '#fee2e2' : reg.status === 'rejected' ? '#f3f4f6' : '#fef9c3',
                              color: reg.status === 'approved' ? '#166534' : reg.status === 'auto_rejected' ? '#991b1b' : reg.status === 'rejected' ? '#374151' : '#854d0e'
                            }}>
                              {reg.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {reg.status === 'pending' && (
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <button onClick={() => handleUpdateStatus(reg.id, 'approved')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                                <button onClick={() => handleUpdateStatus(reg.id, 'rejected')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                              </div>
                            )}
                            {reg.status === 'approved' && (
                                <button onClick={() => handleUpdateStatus(reg.id, 'rejected')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Revoke</button>
                            )}
                            {reg.status === 'auto_rejected' && (
                                <button onClick={() => handleUpdateStatus(reg.id, 'approved')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Force Approve</button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CampDetails;