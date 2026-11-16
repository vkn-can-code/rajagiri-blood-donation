// src/components/ForgotPasswordModal.jsx
import React, { useState } from 'react';
import { Mail, X, Send, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../services/authService';
import styles from './ForgotPasswordModal.module.css';

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {sent ? (
          /* ── Success state ── */
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <CheckCircle size={44} />
            </div>
            <h2 className={styles.title}>Check Your Email</h2>
            <p className={styles.subtitle}>
              If an account with <strong>{email}</strong> exists, we've sent a password
              reset link. It expires in <strong>15 minutes</strong>.
            </p>
            <button className={styles.doneBtn} onClick={onClose}>
              Back to Login
            </button>
          </div>
        ) : (
          /* ── Email entry state ── */
          <>
            <div className={styles.iconWrapper}>
              <Mail size={36} className={styles.icon} />
            </div>
            <h2 className={styles.title}>Forgot Password?</h2>
            <p className={styles.subtitle}>
              Enter your registered email and we'll send you a reset link.
            </p>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                  autoFocus
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  <><Send size={16} /> Send Reset Link</>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
