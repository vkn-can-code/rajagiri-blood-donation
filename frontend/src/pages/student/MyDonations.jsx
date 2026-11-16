import React, { useState, useEffect, useCallback } from 'react';
import { getMyDonations, uploadDonation } from '../../services/studentService';
import { getAllOpenRequests } from '../../services/publicService';
import { BASE_URL } from '../../services/api'; // Import BASE_URL
import styles from './MyDonations.module.css';

// const API_BASE_URL = 'http://localhost:3001'; // Removed hardcoded URL

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Form state
  const [donationDate, setDonationDate] = useState('');
  const [description, setDescription] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [requests, setRequests] = useState([]); // --- NEW: Store requests ---
  const [selectedRequestId, setSelectedRequestId] = useState(''); // --- NEW: Selected Request ---

  const fetchDonations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyDonations();
      setDonations(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- NEW: Fetch Open Requests ---
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const reqs = await getAllOpenRequests();
        setRequests(reqs);
      } catch (err) {
        console.error("Failed to load requests", err);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!donationDate || !certificateFile) {
      setError('Please provide both a date and a certificate file.');
      return;
    }

    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append('donation_date', donationDate);
    formData.append('certificate', certificateFile);
    formData.append('description', description);
    if (selectedRequestId) {
      formData.append('blood_request_id', selectedRequestId); // --- SEND REQUEST ID ---
    }

    try {
      const result = await uploadDonation(formData);
      setMessage(result.message);
      setDonationDate('');
      setDescription('');
      setSelectedRequestId('');
      setCertificateFile(null);
      e.target.reset();
      fetchDonations();
    } catch (err) {
      setError(err.toString());
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const StatusBadge = ({ status }) => {
    let statusClass;
    switch (status) {
      case 'approved': statusClass = styles.statusApproved; break;
      case 'rejected': statusClass = styles.statusRejected; break;
      default: statusClass = styles.statusPending;
    }
    return <span className={`${styles.statusBadge} ${statusClass}`}>{status}</span>;
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>My Donations</h1>
      <p className={styles.pageSubtitle}>
        Upload your donation certificates here. Add a note if needed.
      </p>

      {message && <div className={styles.messageSuccess}>{message}</div>}
      {error && <div className={styles.messageError}>{error}</div>}

      <div className={styles.contentGrid}>
        <div className={styles.formContainer}>
          <h3 className={styles.containerTitle}>Upload New Donation</h3>
          <form onSubmit={handleSubmit} className={styles.uploadForm}>
            <div className={styles.formGroup}>
              <label htmlFor="donationDate">Donation Date</label>
              <input
                type="date"
                id="donationDate"
                value={donationDate}
                onChange={(e) => setDonationDate(e.target.value)}
                required
              />
            </div>

            {/* --- NEW REQUEST SELECTION --- */}
            <div className={styles.formGroup}>
              <label htmlFor="requestSelect">Linked Request (Optional)</label>
              <select
                id="requestSelect"
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              >
                <option value="">-- None / Voluntary --</option>
                {requests.map(req => (
                  <option key={req.id} value={req.id}>
                    {req.required_blood_group} for {req.patient_name} ({req.hospital_name})
                  </option>
                ))}
              </select>
            </div>
            {/* --- NEW DESCRIPTION FIELD --- */}
            <div className={styles.formGroup}>
              <label htmlFor="description">Note (Optional)</label>
              <textarea
                id="description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Donated at General Hospital via NSS Camp..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="certificate">Certificate File</label>
              <input
                type="file"
                id="certificate"
                accept="image/*,.pdf"
                onChange={(e) => setCertificateFile(e.target.files[0])}
                required
              />
            </div>
            <button type="submit" className={styles.formButton}>
              Upload for Approval
            </button>
          </form>
        </div>

        <div className={styles.listContainer}>
          <h3 className={styles.containerTitle}>My Donation History</h3>
          {isLoading ? (
            <p>Loading history...</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.donationTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Note</th>
                    <th>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>No uploads yet.</td></tr>
                  ) : (
                    donations.map((donation) => (
                      <tr key={donation.id}>
                        <td>{formatDate(donation.donation_date)}</td>
                        <td>
                          <StatusBadge status={donation.status} />
                          {/* --- SHOW REJECTION REASON --- */}
                          {donation.status === 'rejected' && donation.rejection_reason && (
                            <div style={{ fontSize: '0.85rem', color: '#b91c1c', marginTop: '4px' }}>
                              Reason: {donation.rejection_reason}
                            </div>
                          )}
                        </td>
                        <td style={{ maxWidth: '200px', fontSize: '0.9rem', color: '#555' }}>
                          {donation.description || '-'}
                        </td>
                        <td>
                          <a
                            href={`${BASE_URL}${donation.certificate_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.certificateLink}
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDonations;