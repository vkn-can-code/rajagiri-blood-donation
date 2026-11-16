// This file is src/pages/volunteer/VolunteerDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';

// NOTE: This file will not work until you create:
// 1. ../../services/volunteerService.js
import { getNewResponses, markResponseAsContacted } from '../../services/volunteerService';

// NOTE: This file will not work until you create:
// 2. ./VolunteerDashboard.module.css
import styles from './VolunteerDashboard.module.css';

const VolunteerDashboard = () => {
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Fetch all 'new' responses
  const fetchResponses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);
      const data = await getNewResponses();
      setResponses(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on component load
  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  // Handle marking a response as "contacted"
  const handleContacted = async (responseId) => {
    if (window.confirm('Mark this donor as contacted?')) {
      setError(null);
      setMessage(null);
      try {
        const result = await markResponseAsContacted(responseId);
        setMessage(result.message);
        // Refresh the list (the contacted item will disappear)
        fetchResponses(); 
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>New Donor Responses</h1>
      <p className={styles.pageSubtitle}>
        Follow up with users who have responded to urgent requests.
      </p>

      {message && <div className={styles.messageSuccess}>{message}</div>}
      {error && <div className={styles.messageError}>{error}</div>}

      {isLoading ? (
        <p>Loading new responses...</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Responder</th>
                <th>Responder Email</th>
                <th>Request (Patient)</th>
                <th>Request (Hospital)</th>
                <th>Admin Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {responses.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No new responses found.
                  </td>
                </tr>
              ) : (
                responses.map((res) => (
                  <tr key={res.id}>
                    {/* The person who responded */}
                    <td>{res.User.name}</td>
                    <td>{res.User.email}</td>
                    {/* The request they responded to */}
                    <td>{res.BloodRequest.patient_name}</td>
                    <td>{res.BloodRequest.hospital_name}</td>
                    {/* The admin who created the request */}
                    <td>{res.BloodRequest.User.name} ({res.BloodRequest.User.phone_number})</td>
                    <td className={styles.actionsCell}>
                      <button 
                        onClick={() => handleContacted(res.id)}
                        className={styles.contactButton}
                      >
                        Mark as Contacted
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;