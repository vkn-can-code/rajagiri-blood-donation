// This file is src/context/AuthContext.jsx
// This is the "brain" of the app, holding the user's login state.

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getMyProfile } from '../services/authService.js'; 
import api from '../services/api.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    if (token) {
      // Set token for all future 'api' requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const profileData = await getMyProfile();
        setUser(profileData);
        setRole(profileData.role);
      } catch (error) {
        console.error("Failed to fetch profile, logging out:", error);
        logout(); // Token is invalid
      }
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    setToken(userToken);
    setUser(userData);
    setRole(userData.role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.defaults.headers.common['Authorization'] = null;
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const isAuthenticated = !!token;

  const value = {
    token,
    user,
    role,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};