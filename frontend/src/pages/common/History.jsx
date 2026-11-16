import React, { useState, useEffect } from 'react';
import { getAdminHistory, getFacultyHistory } from '../../services/historyService';
import { useAuth } from '../../hooks/useAuth';
import styles from './History.module.css';
import Spinner from '../common/Spinner';
import { ChevronDown, ChevronRight } from 'lucide-react';

const History = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ requests: [], camps: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'camps'
  
  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        let result;
        if (user.role === 'admin' || user.role === 'super_admin') {
          result = await getAdminHistory();
        } else if (user.role === 'faculty_admin') {
          result = await getFacultyHistory();
        }
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

  if (loading) return <Spinner />;
  if (error) return <div className="message-error">{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>
        {user.role === 'faculty_admin' ? 'Batch Participation History' : 'System History Log'}
      </h1>

      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'requests' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Blood Requests ({data.requests.length})
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'camps' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('camps')}
        >
          Donation Camps ({data.camps.length})
        </button>
      </div>

      <div className={styles.tableCard}>
        {activeTab === 'requests' ? (
          // --- REQUESTS TABLE ---
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th style={{width: '50px'}}></th>
                <th>Date</th>
                <th>Patient</th>
                <th>Hospital</th>
                <th>Participants</th>
              </tr>
            </thead>
            <tbody>
              {data.requests.map(req => (
                <React.Fragment key={req.id}>
                  <tr onClick={() => toggleRow(req.id)} style={{cursor: 'pointer'}}>
                    <td>
                      {expandedRows[req.id] ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                    </td>
                    <td>{formatDate(req.createdAt)}</td>
                    <td>{req.patient_name}</td>
                    <td>{req.hospital_name}</td>
                    <td>
                      <strong>{req.RequestResponses?.length || 0}</strong> Responders
                    </td>
                  </tr>
                  {expandedRows[req.id] && (
                    <tr className={styles.expandRow}>
                      <td colSpan="5">
                        <div style={{padding: '0 1rem 1rem 3rem'}}>
                          <h4>Responders List:</h4>
                          {req.RequestResponses && req.RequestResponses.length > 0 ? (
                            <table className={styles.subTable}>
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Email</th>
                                  <th>Phone</th>
                                  <th>Response Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {req.RequestResponses.map(res => (
                                  <tr key={res.id}>
                                    <td>{res.User.name}</td>
                                    <td>{res.User.email}</td>
                                    <td>{res.User.phone_number}</td>
                                    <td>{formatDate(res.createdAt)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : <p className={styles.emptyMessage}>No responders found.</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          // --- CAMPS TABLE ---
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th style={{width: '50px'}}></th>
                <th>Date</th>
                <th>Title</th>
                <th>Location</th>
                <th>Donors</th>
              </tr>
            </thead>
            <tbody>
              {data.camps.map(camp => (
                <React.Fragment key={camp.id}>
                  <tr onClick={() => toggleRow(camp.id)} style={{cursor: 'pointer'}}>
                    <td>
                      {expandedRows[camp.id] ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                    </td>
                    <td>{formatDate(camp.camp_date)}</td>
                    <td>{camp.title}</td>
                    <td>{camp.location}</td>
                    <td>
                      <strong>{camp.Donations?.length || 0}</strong> Donors
                    </td>
                  </tr>
                  {expandedRows[camp.id] && (
                    <tr className={styles.expandRow}>
                      <td colSpan="5">
                        <div style={{padding: '0 1rem 1rem 3rem'}}>
                          <h4>Donor List:</h4>
                          {camp.Donations && camp.Donations.length > 0 ? (
                            <table className={styles.subTable}>
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Email</th>
                                  <th>Phone</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {camp.Donations.map(don => (
                                  <tr key={don.id}>
                                    <td>{don.User.name}</td>
                                    <td>{don.User.email}</td>
                                    <td>{don.User.phone_number}</td>
                                    <td>
                                      <span style={{
                                        color: don.status === 'approved' ? 'green' : 'orange',
                                        fontWeight: 'bold',
                                        textTransform: 'capitalize'
                                      }}>
                                        {don.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : <p className={styles.emptyMessage}>No donors found.</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default History;