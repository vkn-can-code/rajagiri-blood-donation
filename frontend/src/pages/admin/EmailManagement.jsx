import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmationContext';
import styles from './EmailManagement.module.css';
import { Send, Clock, AlertCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const EMAIL_TEMPLATES = [
  {
    id: 'custom',
    name: 'Custom / Plain Text',
    subject: '',
    defaultMessage: 'Type your message here...',
    generateHtml: (text) => text.replace(/\n/g, '<br>')
  },
  {
    id: 'announcement',
    name: 'General Announcement',
    subject: 'Important Update from RLYFE Dashboard',
    defaultMessage: 'We are writing to inform you about an important update regarding your RLYFE Blood Donation account.\n\n[Insert details here...]',
    generateHtml: (text) => `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
  <h2 style="color: #d93025; text-align: center;">RLYFE Announcement</h2>
  <p>Hello,</p>
  <div style="font-size: 16px; line-height: 1.5; color: #333;">
    ${text.replace(/\n/g, '<br>')}
  </div>
  <br>
  <p>Thank you for your continued support!</p>
  <p><strong>- The RLYFE Team</strong></p>
</div>`
  },
  {
    id: 'urgent_request',
    name: 'Urgent Alert',
    subject: 'URGENT: Blood Donation Needed',
    defaultMessage: 'Blood Group Required: [O+]\nLocation: [Hospital Name]\nContact: [Phone Number]\n\nAn urgent request matching your profile has been created in your area. If you are eligible and able to donate, please check the app immediately or contact the number provided.',
    generateHtml: (text) => `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff3f3; border: 2px solid #d93025; border-radius: 8px;">
  <h2 style="color: #d93025; text-align: center; text-transform: uppercase;">Urgent Blood Request</h2>
  <div style="font-size: 16px; line-height: 1.5; color: #333; margin: 20px 0;">
    ${text.replace(/\n/g, '<br>')}
  </div>
  <div style="text-align: center; margin-top: 25px;">
    <a href="#" style="background-color: #d93025; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Request Details</a>
  </div>
</div>`
  },
  {
    id: 'newsletter',
    name: 'Monthly Newsletter',
    subject: 'RLYFE Monthly Newsletter',
    defaultMessage: 'Welcome to this month\'s newsletter!\n\nHere are some highlights from the past month:\n- Milestone 1\n- Milestone 2\n\nStay tuned for more updates next month.',
    generateHtml: (text) => `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <div style="background-color: #d93025; padding: 20px; text-align: center; color: white;">
    <h1 style="margin: 0;">RLYFE Impact Report</h1>
  </div>
  <div style="padding: 30px; font-size: 16px; line-height: 1.6; color: #444;">
    ${text.replace(/\n/g, '<br>')}
  </div>
  <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #888;">
    <p>&copy; ${new Date().getFullYear()} RLYFE. All rights reserved.</p>
  </div>
</div>`
  },
  {
    id: 'camp_invite',
    name: 'Blood Camp Invitation',
    subject: 'You\'re Invited: Upcoming Blood Donation Camp!',
    defaultMessage: 'We are organizing a blood donation camp in your area!\n\nDate: [Date]\nTime: [Time]\nVenue: [Location]\n\nYour single donation can save up to 3 lives. We hope to see you there!',
    generateHtml: (text) => `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border-top: 5px solid #d93025; background-color: #fafafa; border-radius: 0 0 8px 8px;">
  <h2 style="color: #333;">Blood Donation Camp Details</h2>
  <div style="font-size: 15px; line-height: 1.6; background: white; padding: 20px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-top: 20px;">
    ${text.replace(/\n/g, '<br>')}
  </div>
  <p style="text-align: center; margin-top: 30px;">
    <a href="#" style="background-color: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Register Now</a>
  </p>
</div>`
  }
];

const EmailManagement = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  
  const [activeTab, setActiveTab] = useState('sent'); // 'sent', 'scheduled', 'compose'
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Recipient Category State
  const [recipientCategory, setRecipientCategory] = useState('custom');

  // Compose Form
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
    scheduled_at: ''
  });

  useEffect(() => {
    if (activeTab === 'sent' || activeTab === 'scheduled') {
      fetchEmails(activeTab === 'sent' ? 'history' : 'scheduled');
    }
  }, [activeTab, page]);

  const fetchEmails = async (status) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/emails', {
        params: { status, page, limit: 10 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEmails(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      showToast('Failed to fetch emails', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        message: template.defaultMessage
      }));
    }
  };

  // Helper to get the rendered HTML for preview/submit
  const getRenderedHtml = () => {
    const template = EMAIL_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return formData.message;
    return template.generateHtml(formData.message || ' ');
  };

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    
    // Determine the actual 'to' target based on the dropdown category
    let finalRecipient = recipientCategory === 'custom' ? formData.to : `CATEGORY:${recipientCategory}`;

    if (!finalRecipient || !formData.subject || (!formData.message && !getRenderedHtml())) {
      return showToast('Please fill out all required fields.', 'error');
    }

    try {
      // Package up the API payload using the computed HTML
      const payload = {
        to: finalRecipient,
        subject: formData.subject,
        html: getRenderedHtml(),
        scheduled_at: formData.scheduled_at
      };

      await axios.post('/api/admin/emails/schedule', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      showToast(formData.scheduled_at ? 'Email scheduled successfully!' : 'Email sent successfully!', 'success');
      setFormData({ to: '', subject: '', message: '', scheduled_at: '' });
      setSelectedTemplate('custom');
      setRecipientCategory('custom');
      setActiveTab(formData.scheduled_at ? 'scheduled' : 'sent');
      setPage(1);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to dispatch email.', 'error');
      // Force history refresh in case the dispatch failed synchronously and was logged
      setActiveTab('sent');
      setPage(1);
    }
  };

  const handleCancelEmail = async (id) => {
    const isConfirmed = await confirm("Are you sure you want to cancel this scheduled email?");
    if (!isConfirmed) return;

    try {
      await axios.delete(`/api/admin/emails/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      showToast('Scheduled email cancelled.', 'success');
      fetchEmails('scheduled');
    } catch (error) {
      showToast('Failed to cancel email', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return <div className={styles.error}>Unauthorized Access</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Email Management</h1>
        <p>Monitor system emails, view scheduled tasks, and dispatch custom messages.</p>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'sent' ? styles.active : ''}`}
          onClick={() => { setActiveTab('sent'); setPage(1); }}
        >
          <Send size={16} /> History Log
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'scheduled' ? styles.active : ''}`}
          onClick={() => { setActiveTab('scheduled'); setPage(1); }}
        >
          <Clock size={16} /> Scheduled
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'compose' ? styles.active : ''}`}
          onClick={() => setActiveTab('compose')}
        >
          <AlertCircle size={16} /> Compose New
        </button>
      </div>

      {/* LIST VIEW */}
      {(activeTab === 'sent' || activeTab === 'scheduled') && (
        <div className={styles.emailList}>
          {loading ? (
            <div className={styles.loading}>Loading emails...</div>
          ) : emails.length === 0 ? (
            <div className={styles.loading}>No emails found.</div>
          ) : (
            <>
              {emails.map((email) => (
                <div key={email.id} className={styles.emailItem}>
                  <div className={styles.emailInfo}>
                    <h3>{email.subject}</h3>
                    <p><strong>To:</strong> {email.recipient_email}</p>
                    {activeTab === 'sent' && <p><strong>Date:</strong> {formatDate(email.sent_at || email.createdAt)}</p>}
                    {activeTab === 'scheduled' && <p><strong>Scheduled For:</strong> {formatDate(email.scheduled_at)}</p>}
                    {email.error_message && <p className={styles.error}><strong>Error:</strong> {email.error_message}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`${styles.statusBadge} ${
                      email.status === 'sent' ? styles.statusSent : 
                      email.status === 'scheduled' ? styles.statusScheduled : 
                      styles.statusFailed
                    }`}>
                      {email.status}
                    </span>
                    {activeTab === 'scheduled' && (
                      <button 
                        className={styles.cancelBtn} 
                        onClick={() => handleCancelEmail(email.id)}
                      >
                        <XCircle size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    className={styles.pageBtn} 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {page} of {totalPages}</span>
                  <button 
                    className={styles.pageBtn} 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* COMPOSE VIEW */}
      {activeTab === 'compose' && (
        <div className={styles.composeContainer}>
          {/* Left Column: Form */}
          <form className={styles.composeForm} onSubmit={handleComposeSubmit}>
            
            <div className={styles.formGroup}>
              <label>Use Template</label>
              <select 
                className={styles.templateSelect}
                value={selectedTemplate}
                onChange={handleTemplateChange}
              >
                {EMAIL_TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Recipient Category *</label>
              <select 
                className={styles.templateSelect}
                value={recipientCategory}
                onChange={e => setRecipientCategory(e.target.value)}
              >
                <option value="custom">Specific Email Address</option>
                <option value="all">All Activated Users</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
                <option value="volunteer">Volunteers</option>
                <option value="admin">Administrators</option>
              </select>
            </div>

            {recipientCategory === 'custom' && (
              <div className={styles.formGroup}>
                <label>Recipient Email *</label>
                <input 
                  type="email" 
                  required 
                  placeholder="user@example.com"
                  value={formData.to}
                  onChange={e => setFormData({...formData, to: e.target.value})}
                />
              </div>
            )}
            <div className={styles.formGroup}>
              <label>Subject *</label>
              <input 
                type="text" 
                required 
                placeholder="Email Subject"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Message Content *</label>
              <textarea 
                required 
                rows="14"
                placeholder="Type your message here..."
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Schedule At (Optional)</label>
              <input 
                type="datetime-local" 
                value={formData.scheduled_at}
                onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
              />
              <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                Leave blank to send immediately.
              </small>
            </div>
            <button type="submit" className={styles.submitBtn}>
              <Send size={18} /> Dispatch Email
            </button>
          </form>

          {/* Right Column: Live Preview */}
          <div className={styles.composePreview}>
            <h3>Live Email Preview</h3>
            <iframe 
              className={styles.previewFrame}
              title="Email HTML Preview"
              srcDoc={getRenderedHtml() || '<div style="color: #999; text-align: center; padding-top: 50px; font-family: sans-serif;">Live Preview will appear here...</div>'}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default EmailManagement;
