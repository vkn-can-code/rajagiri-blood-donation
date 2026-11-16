// This file is src/pages/auth/RegisterForm.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import InputField from '../common/InputField';
import Button from '../common/Button';
import styles from './RegisterForm.module.css'; // New CSS file

const RegisterForm = ({
  handleSubmit,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  isLoading
}) => {
  return (
    <div className={styles.formCard}>
      <h2 className={styles.formTitle}>Create Account</h2>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <InputField
          label="Full Name"
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <InputField
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <InputField
          label="Phone Number"
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <InputField
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          required
        />

        <InputField
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        <Button 
          type="submit" 
          variant="primary" 
          className={styles.fullWidthButton}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Create Account'}
        </Button>
      </form>

      <p className={styles.formLink}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default RegisterForm;