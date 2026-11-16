// This file is src/hooks/useAuth.js
// It's a shortcut to make using the AuthContext easier.

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx'; // This file is provided below

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};