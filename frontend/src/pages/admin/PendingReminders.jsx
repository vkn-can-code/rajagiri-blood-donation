import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './UserManagement.module.css'; // Reusing UserManagement styles for consistency
import Button from '../common/Button';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../../utils/swalUtils';

const PendingReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/pending-reminders');
      setReminders(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      showError("Error", "Failed to fetch pending reminders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleSendReminders = async () => {
    if (reminders.length === 0) {
      return showError("No Reminders", "There are no pending reminders to send.");
    }

    const confirmed = await showConfirm(
      "Send Reminders?",
      `Are you sure you want to email ${reminders.length} faculty admin(s)?`,
      "Yes, Send"
    );

    if (!confirmed) return;

    try {
      setIsSending(true);
      const res = await api.post('/admin/pending-reminders/send', { reminders });
      showSuccess("Success", res.data.message);
      fetchReminders(); // Re-fetch to verify state if needed, though they are still pending
    } catch (err) {
      showError("Failed", err.response?.data?.message || err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className={styles.pageTitle} style={{ margin: 0 }}>Pending Certificates Reminders</h1>
        <Button 
          onClick={handleSendReminders} 
          disabled={isSending || reminders.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Mail size={18} />
          {isSending ? 'Sending...' : 'Send Reminders to All'}
        </Button>
      </div>

      <div className={styles.listContainer}>
        {isLoading ? (
          <p style={{ padding: '2rem' }}>Loading pending reminders...</p>
        ) : reminders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
            <CheckCircle size={48} color="#16a34a" style={{ marginBottom: '1rem' }} />
            <h3>All Caught Up!</h3>
            <p>There are no pending donation certificates waiting for faculty approval.</p>
          </div>
        ) : (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Faculty Admin</th>
                <th>Department / Batch</th>
                <th>Pending Approvals</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder) => (
                <tr key={reminder.facultyId}>
                  <td>
                    <strong>{reminder.facultyDetails?.name}</strong>
                    <br />
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>{reminder.facultyDetails?.email}</span>
                  </td>
                  <td>
                    {reminder.departmentName} - {reminder.batchName}
                  </td>
                  <td>
                    <span style={{ 
                      background: '#fef08a', 
                      color: '#b45309', 
                      padding: '4px 12px', 
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}>
                      {reminder.pendingDonations.length} Pending
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b91c1c' }}>
                      <AlertCircle size={16} /> Needs Action
                    </span>
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

export default PendingReminders;
