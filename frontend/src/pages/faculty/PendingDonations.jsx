// This file is// src/pages/faculty/PendingDonations.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api, { BASE_URL } from '../../services/api';
import {
  getPendingDonations,
  approveDonation
} from '../../services/facultyService';
import styles from './PendingDonations.module.css';
import { FileText, Check, X, ClipboardCheck, MessageSquare } from 'lucide-react';
import Spinner from '../common/Spinner';

// const API_BASE_URL = 'http://localhost:3001'; // Removed hardcoded URL

const PendingDonations = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchPending = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);
      const data = await getPendingDonations();
      setDonations(data);
    } catch (err) {
      console.error("Fetch pending error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to load donations.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (donationId) => {
    if (!window.confirm("Are you sure you want to approve this donation?")) return;
    try {
      const result = await approveDonation(donationId);
      setMessage(result.message);
      fetchPending();
    } catch (err) {
      setError(err.toString());
    }
  };

  const handleReject = async (donationId) => {
    const reason = window.prompt("Please enter the reason for rejection (e.g., Image unclear, wrong date):");

    if (reason === null) return; // User cancelled
    if (reason.trim() === "") {
      alert("Rejection reason is required.");
      return;
    }

    try {
      const response = await api.post(`/faculty_admin/donations/${donationId}/reject`, { reason });
      setMessage(response.data.message);
      fetchPending();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) return <div style={{ marginTop: '5rem' }}><Spinner /></div>;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Pending Approvals</h1>
      <p className={styles.pageSubtitle}>
        Review student donation certificates. Verify attributes before approving.
      </p>

      {message && <div className={styles.messageSuccess}><Check size={20} style={{ marginRight: 8 }} /> {message}</div>}
      {error && <div className={styles.messageError}>{error}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Donation Date</th>
              <th>Student Note</th>
              <th>Certificate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <ClipboardCheck size={40} color="#cbd5e1" />
                    No pending donations found.
                  </div>
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation.id}>
                  <td>
                    <div><strong>{donation.User ? donation.User.name : 'Unknown User'}</strong></div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{donation.User ? donation.User.email : '-'}</div>
                  </td>
                  <td>{formatDate(donation.donation_date)}</td>

                  {/* --- STUDENT NOTE --- */}
                  <td style={{ maxWidth: '250px' }}>
                    {donation.description ? (
                      <div className={styles.noteText}>
                        <MessageSquare size={14} style={{ display: 'inline', marginRight: 4 }} />
                        "{donation.description}"
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                  </td>

                  <td>
                    <a
                      href={`${BASE_URL}${donation.certificate_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.certificateLink}
                    >
                      <FileText size={16} /> View Proof
                    </a>
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      onClick={() => handleApprove(donation.id)}
                      className={`${styles.actionButton} ${styles.approveButton}`}
                      title="Approve"
                    >
                      <Check size={16} style={{ marginRight: 4 }} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(donation.id)}
                      className={`${styles.actionButton} ${styles.rejectButton}`}
                      title="Reject"
                    >
                      <X size={16} style={{ marginRight: 4 }} /> Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingDonations;