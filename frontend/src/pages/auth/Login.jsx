// This file is src/pages/auth/Login.jsx

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Users, Droplets, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { login as loginService } from '../../services/authService';

import LoginForm from './LoginForm';
import FirstLoginModal from '../../components/FirstLoginModal';
import styles from './LoginForm.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null); // holds { user, token } when first login

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { token, user } = await loginService({ email, password });

      if (user.is_first_login) {
        // Store token immediately so the change-password API call is authenticated
        login(user, token);
        setPendingUser({ user, token });
      } else {
        login(user, token);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChanged = () => {
    // Password has been reset — navigate to dashboard
    navigate(from, { replace: true });
  };

  return (
    <div className={styles.loginPage}>

      {/* First-login password reset modal */}
      {pendingUser && (
        <FirstLoginModal onSuccess={handlePasswordChanged} />
      )}

      {/* Left Pane - Branding & Illustration */}
      <div className={styles.leftSection}>
        <div className={styles.brandLogo}>
          <div className={styles.brandIconDroplet}>
            <Heart size={20} className={styles.brandIconHeart} fill="white" />
          </div>
          <div>
            <div className={styles.brandText}>RLyfe</div>
            <div style={{fontSize: '0.8rem', color: '#166534', fontWeight: 600}}>Give Blood. Give Life.</div>
          </div>
        </div>

        <h1 className={styles.heroTitle}>
          One Act of Kindness<br />
          Can <span>Save Many Lives.</span>
        </h1>
        
        <p className={styles.heroSubtitle}>
          RLyfe connects donors and those in need, making blood donation simple, fast and meaningful.
        </p>

        {/* Decorative central droplet / people placeholder */}
        <div className={styles.centerDropletWrapper}>
          <div className={styles.bigDroplet}>
             <Heart size={64} fill="white" color="white" className={styles.bigDropletHeart} />
          </div>
        </div>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <ShieldCheck size={28} className={styles.featureIcon} />
            Secure<br/>and Reliable
          </div>
          <div className={styles.featureItem}>
            <Users size={28} className={styles.featureIcon} />
            Connect<br/>Quickly
          </div>
          <div className={styles.featureItem}>
            <Droplets size={28} className={styles.featureIcon} />
            Save Lives<br/>Together
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className={styles.rightSection}>
        <LoginForm
          handleSubmit={handleSubmit}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          error={error}
          isLoading={isLoading}
        />
      </div>

    </div>
  );
};

export default Login;