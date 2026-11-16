// This file is src/pages/student/StudentDashboard.jsx
// --- REBUILT with FIXED import paths ---

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getMyDonations } from '../../services/studentService';
import styles from './StudentDashboard.module.css';

// --- !! THIS IS THE FIX !! ---
// The path must go up two levels to ../../
import Spinner from '../common/Spinner';
import Button from '../common/Button';
// --- END FIX ---

// Helper component for the status badge
const StatusBadge = ({ status }) => {
  let statusClass = '';
  switch (status) {
    case 'approved':
      statusClass = styles.statusApproved;
      break;
    case 'rejected':
      statusClass = styles.statusRejected;
      break;
    case 'pending':
    default:
      statusClass = styles.statusPending;
  }
  return <span className={`${styles.statusBadge} ${statusClass}`}>{status}</span>;
};

// Helper to format dates
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const StudentDashboard = () => {
  const { user } = useAuth(); // Get user info from context
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch donation history on component load
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const data = await getMyDonations();
        // Sort donations by date, most recent first
        data.sort((a, b) => new Date(b.donation_date) - new Date(a.donation_date));
        setDonations(data);
      } catch (err) {
        // err is a string from the service
        setError(err || 'Failed to fetch donation history.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch donations if the user is loaded
    if (user) {
      fetchDonations();
    } else {
      // If user isn't loaded yet, don't show loading spinner for donations
      setIsLoading(false);
    }
  }, [user]); // Only run when the user object is available

  // Calculate stats and eligibility using useMemo
  const {
    approvedCount,
    pendingCount,
    lastDonationDate,
    nextEligibilityDate,
    isEligible
  } = useMemo(() => {
    const approvedDonations = donations.filter(d => d.status === 'approved');
    const pendingDonations = donations.filter(d => d.status === 'pending');

    let lastDonationDate = null;
    let nextEligibilityDate = null;
    let isEligible = true; // Eligible by default if no approved donations

    if (approvedDonations.length > 0) {
      // Find the most recent approved donation
      const lastApproved = approvedDonations[0]; // Already sorted
      lastDonationDate = new Date(lastApproved.donation_date);

      // Calculate next eligibility (90 days after last donation)
      nextEligibilityDate = new Date(lastDonationDate);
      nextEligibilityDate.setDate(lastDonationDate.getDate() + 90);

      // Check if today is past the eligibility date
      isEligible = new Date() > nextEligibilityDate;
    }

    return {
      approvedCount: approvedDonations.length,
      pendingCount: pendingDonations.length,
      lastDonationDate,
      nextEligibilityDate,
      isEligible
    };
  }, [donations]);

  // Get the 3 most recent donations for the table
  const recentDonations = donations.slice(0, 3);

  // --- !! SECONDARY FIX !! ---
  // If the user object isn't loaded yet, just show a spinner.
  if (!user) {
    return <Spinner />;
  }
  // --- END FIX ---

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>My Dashboard</h1>
      <p className={styles.pageSubtitle}>Welcome back, {user.name}!</p>

      {error && <p className={styles.messageError}>{error}</p>}

      <div className={styles.dashboardGrid}>
        
        {/* --- Card 1: My Profile --- */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>My Profile</h3>
          <ul className={styles.profileList}>
            <li className={styles.profileItem}>
              <span>Name</span>
              <strong>{user.name}</strong>
            </li>
            <li className={styles.profileItem}>
              <span>Email</span>
              <strong>{user.email}</strong>
            </li>
            {user.StudentBatch ? (
              <li className={styles.profileItem}>
                <span>Batch</span>
                <strong>{user.StudentBatch.batch_name} (Sem {user.StudentBatch.current_semester})</strong>
              </li>
            ) : (
              <li className={styles.profileItem}>
                <span>Batch</span>
                <strong>Not Assigned</strong>
              </li>
            )}
            <li className={styles.profileItem}>
              <span>Role</span>
              <strong className={styles.profileRole}>{user.role}</strong>
            </li>
          </ul>
        </div>

        {/* --- Card 2: Donation Stats --- */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Donation Stats</h3>
          <div className={styles.statGrid}>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{approvedCount}</span>
              <span className={styles.statLabel}>Donations Approved</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{pendingCount}</span>
              <span className={styles.statLabel}>Pending Approval</span>
            </div>
          </div>
        </div>

        {/* --- Card 3: Eligibility --- */}
        <div className={`${styles.card} ${isEligible ? styles.eligibleCard : styles.ineligibleCard}`}>
          <h3 className={styles.cardTitle}>Donation Eligibility</h3>
          {isEligible ? (
            <p className={styles.eligibilityText}>
              You are eligible to donate!
            </p>
          ) : (
            <>
              <p className={styles.eligibilityText}>You are not yet eligible to donate.</p>
              {nextEligibilityDate && (
                <p className={styles.eligibilitySubtext}>
                  Your next eligible date is after {formatDate(nextEligibilityDate)}.
                </p>
              )}
            </>
          )}
          {lastDonationDate && (
            <p className={styles.eligibilitySubtext}>
              Last approved donation: {formatDate(lastDonationDate)}
            </p>
          )}
        </div>

        {/* --- Card 4: Quick Actions --- */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Quick Actions</h3>
          <div className={styles.actionGrid}>
            <Link to="/student/my-donations">
              <Button variant="primary" className={styles.actionButton}>
                Upload New Certificate
              </Button>
            </Link>
            <Link to="/requests">
              <Button variant="secondary" className={styles.actionButton}>
                View Urgent Requests
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* --- Section 2: Recent History --- */}
      <div className={`${styles.card} ${styles.fullWidthCard}`}>
        <h3 className={styles.cardTitle}>Recent Donation History</h3>
        {isLoading ? (
          <Spinner />
        ) : recentDonations.length === 0 ? (
          <p>You have not uploaded any donations yet.</p>
        ) : (
          <table className={styles.donationTable}>
            <thead>
              <tr>
                <th>Donation Date</th>
                <th>Status</th>
                <th>Certificate</th>
              </tr>
            </thead>
            <tbody>
              {recentDonations.map(donation => (
                <tr key={donation.id}>
                  <td>{formatDate(donation.donation_date)}</td>
                  <td><StatusBadge status={donation.status} /></td>
                  <td>
                    <a 
                      href={donation.certificate_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.certificateLink}
                    >
                      View File
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default StudentDashboard;