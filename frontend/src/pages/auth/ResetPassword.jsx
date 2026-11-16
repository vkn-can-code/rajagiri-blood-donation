// src/pages/auth/ResetPassword.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldCheck, Check, X, User as UserIcon } from 'lucide-react';
import { resetPassword, verifyResetToken } from '../../services/authService';
import styles from './ResetPassword.module.css';

/* ── Reuse same strength logic ── */
const RULES = [
  { id: 'length', label: 'At least 6 characters',              test: (p) => p.length >= 6 },
  { id: 'number', label: 'Contains a number',                  test: (p) => /\d/.test(p) },
  { id: 'upper',  label: 'Has an uppercase letter or symbol',  test: (p) => /[A-Z!@#$%^&*]/.test(p) },
];
const getStrength = (p) => {
  const n = RULES.filter((r) => r.test(p)).length;
  if (n === 0) return { level: 0, label: '',       color: '' };
  if (n === 1) return { level: 1, label: 'Weak',   color: '#ef4444' };
  if (n === 2) return { level: 2, label: 'Fair',   color: '#f59e0b' };
  return             { level: 3, label: 'Strong', color: '#10b981' };
};

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token    = params.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);

  // New states for verifying token
  const [isVerifying, setIsVerifying] = useState(true);
  const [targetUser, setTargetUser]   = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new one.');
        setIsVerifying(false);
        return;
      }
      try {
        const res = await verifyResetToken(token);
        setTargetUser(res.user);
      } catch (err) {
        setError(err.message || 'Invalid or expired token.');
      } finally {
        setIsVerifying(false);
      }
    };
    checkToken();
  }, [token]);

  const strength    = useMemo(() => getStrength(newPassword), [newPassword]);
  const rulesPassed = RULES.map((r) => ({ ...r, passed: r.test(newPassword) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token)              return setError('Invalid reset link. Please request a new one.');
    if (strength.level < 2) return setError('Please choose a stronger password (at least "Fair").');
    if (newPassword !== confirm) return setError('Passwords do not match.');

    try {
      setLoading(true);
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.iconWrapper}>
          <ShieldCheck size={40} className={styles.icon} />
        </div>

        {done ? (
          <div className={styles.successState}>
            <h2 className={styles.title}>Password Reset!</h2>
            <p className={styles.subtitle}>
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        ) : isVerifying ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '24px', height: '24px', border: '3px solid #059669', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Verifying secure link...</p>
          </div>
        ) : (
          <>
            <h2 className={styles.title}>Set New Password</h2>
            <p className={styles.subtitle}>
              Choose a new password for your account.
            </p>
            
            {targetUser && (
              <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '10px 14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserIcon size={18} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{targetUser.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{targetUser.email}</div>
                </div>
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>

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
                  onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                  {showNew ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              {newPassword && (
                <div className={styles.strengthSection}>
                  <div className={styles.strengthBarRow}>
                    {[1,2,3].map(seg => (
                      <div key={seg} className={styles.strengthSegment}
                        style={{ backgroundColor: strength.level >= seg ? strength.color : '#e5e7eb' }} />
                    ))}
                    <span className={styles.strengthLabel} style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                  <ul className={styles.ruleList}>
                    {rulesPassed.map(r => (
                      <li key={r.id} className={`${styles.ruleItem} ${r.passed ? styles.rulePassed : styles.ruleFailed}`}>
                        {r.passed ? <Check size={13} strokeWidth={3}/> : <X size={13} strokeWidth={3}/>}
                        {r.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                  onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              {confirm && (
                <p className={`${styles.matchHint} ${confirm === newPassword ? styles.matchOk : styles.matchBad}`}>
                  {confirm === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Saving…' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
