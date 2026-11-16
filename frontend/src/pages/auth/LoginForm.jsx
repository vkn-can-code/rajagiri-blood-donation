// This file is src/pages/auth/LoginForm.jsx

import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Building2 } from 'lucide-react';
import styles from './LoginForm.module.css';
import ForgotPasswordModal from '../../components/ForgotPasswordModal';

const LoginForm = ({
  handleSubmit,
  email,
  setEmail,
  password,
  setPassword,
  error,
  isLoading
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      <div className={styles.formCard}>

      <div className={styles.collegeLogoWrapper}>
        <div className={styles.collegeLogo}>
          <Building2 size={48} strokeWidth={1.5} />
          <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>RAJAGIRI COLLEGE</div>
            <div style={{ fontSize: '0.9rem' }}>OF SOCIAL SCIENCES</div>
          </div>
        </div>
        <div className={styles.nssDivider}>NSS UNIT</div>
      </div>

      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Welcome to <span>RLyfe</span></h2>
        <p className={styles.formSubtitle}>Login to continue</p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        <div className={styles.inputGroup}>
          <User className={styles.inputIcon} size={20} />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.inputField}
            placeholder="Username"
          />
        </div>

        <div className={styles.inputGroup}>
          <Lock className={styles.inputIcon} size={20} />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
            placeholder="Password"
          />
          <button 
            type="button" 
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="button"
          className={styles.forgotPassword}
          onClick={() => setShowForgot(true)}
        >
          Forgot Password?
        </button>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Logging in...
            </span>
          ) : 'Login'}
        </button>

      </form>
    </div>
    </>
  );
};

export default LoginForm;