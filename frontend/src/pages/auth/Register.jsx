// This file is src/pages/auth/Register.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { register as registerService } from '../../services/authService';

// Import the new form component
import RegisterForm from './RegisterForm';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 1. Front-end password check
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Call the API service
      const { token, user } = await registerService({
        name,
        email,
        phone_number: phone,
        password
      });
      
      // 3. Log the user in immediately
      login(user, token);

      // 4. Send the user to their dashboard
      navigate('/dashboard', { replace: true });

    } catch (err) {
      // Set error from backend (e.g., "User already exists")
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterForm
      handleSubmit={handleSubmit}
      name={name}
      setName={setName}
      email={email}
      setEmail={setEmail}
      phone={phone}
      setPhone={setPhone}
      password={password}
      setPassword={setPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      error={error}
      isLoading={isLoading}
    />
  );
};

export default Register;