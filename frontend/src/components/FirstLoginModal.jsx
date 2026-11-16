// src/components/FirstLoginModal.jsx
import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck, Check, X } from 'lucide-react';
import { changePassword } from '../services/authService';
import styles from './FirstLoginModal.module.css';

/* ── Password strength logic ───────────────────────────────────────── */
const RULES = [
  { id: 'length',  label: 'At least 6 characters',          test: (p) => p.length >= 6 },
  { id: 'number',  label: 'Contains a number',              test: (p) => /\d/.test(p) },
  { id: 'upper',   label: 'Has an uppercase letter or symbol', test: (p) => /[A-Z!@#$%^&*]/.test(p) },
];

const getStrength = (password) => {
  const passed = RULES.filter((r) => r.test(password)).length;
  if (passed === 0) return { level: 0, label: '',       color: '' };
  if (passed === 1) return { level: 1, label: 'Weak',   color: '#ef4444' };
  if (passed === 2) return { level: 2, label: 'Fair',   color: '#f59e0b' };
  return               { level: 3, label: 'Strong', color: '#10b981' };
};
/* ─────────────────────────────────────────────────────────────────── */

const FirstLoginModal = ({ onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const strength  = useMemo(() => getStrength(newPassword), [newPassword]);
  const rulesPassed = RULES.map((r) => ({ ...r, passed: r.test(newPassword) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (strength.level < 2) {
      return setError('Please choose a stronger password (at least "Fair").');
    }
    if (newPassword !== confirm) {
      return setError('Passwords do not match.');
    }

    try {
      setLoading(true);
      await changePassword(newPassword);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <div className={styles.iconWrapper}>
          <ShieldCheck size={40} className={styles.icon} />
        </div>

        <h2 className={styles.title}>Set Your Password</h2>
        <p className={styles.subtitle}>
          This is your first login. Please set a new password to secure your account.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* ── New password ── */}
          <div className={`${styles.inputGroup} ${newPassword && strength.level === 3 ? styles.inputSuccess : ''}`}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={styles.input}
            />
            <button type="button" className={styles.toggleBtn}
              onClick={() => setShowNew((v) => !v)} tabIndex={-1}>
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* ── Strength bar ── */}
          {newPassword && (
            <div className={styles.strengthSection}>
              <div className={styles.strengthBarRow}>
                {[1, 2, 3].map((seg) => (
                  <div
                    key={seg}
                    className={styles.strengthSegment}
                    style={{ backgroundColor: strength.level >= seg ? strength.color : '#e5e7eb' }}
                  />
                ))}
                <span className={styles.strengthLabel} style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>

              {/* ── Rule checklist ── */}
              <ul className={styles.ruleList}>
                {rulesPassed.map((r) => (
                  <li key={r.id} className={`${styles.ruleItem} ${r.passed ? styles.rulePassed : styles.ruleFailed}`}>
                    {r.passed
                      ? <Check size={13} strokeWidth={3} />
                      : <X size={13} strokeWidth={3} />}
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Confirm password ── */}
          <div className={`${styles.inputGroup} ${confirm && confirm === newPassword ? styles.inputSuccess : ''}`}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className={styles.input}
            />
            <button type="button" className={styles.toggleBtn}
              onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* ── Match indicator ── */}
          {confirm && (
            <p className={`${styles.matchHint} ${confirm === newPassword ? styles.matchOk : styles.matchBad}`}>
              {confirm === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Saving…' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstLoginModal;
