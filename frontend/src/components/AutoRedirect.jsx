// This file is src/components/AutoRedirect.jsx

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const AutoRedirect = () => {
  const { role: contextRole, isLoading } = useAuth();
  const [role, setRole] = useState(contextRole);

  useEffect(() => {
    // 1. If context has a role, use it.
    if (contextRole) {
      setRole(contextRole);
    } else {
      // 2. FALLBACK: Check localStorage directly to prevent race conditions
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setRole(user.role);
        } catch (e) {
          console.error("Error parsing user from storage", e);
        }
      }
    }
  }, [contextRole]);

  // Show spinner while checking
  if (isLoading && !role) {
    return <div className="spinner"></div>; 
  }

  // 3. Routing Logic
  switch (role) {
    case 'admin':
    case 'super_admin': // <--- FIX: Treat super_admin same as admin
      return <Navigate to="/admin/dashboard" replace />;
      
    case 'faculty_admin':
      return <Navigate to="/faculty_admin/dashboard" replace />;
    case 'faculty':
      return <Navigate to="/student/dashboard" replace />; // Standard faculty uses student dashboard 
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    case 'volunteer':
      return <Navigate to="/volunteer/dashboard" replace />;
      
    case 'non_teaching':
        return <Navigate to="/profile" replace />;
        
    default:
      // Only redirect to login if we are done loading AND found no role
      if (!isLoading) {
        return <Navigate to="/login" replace />;
      }
      return null; // Stay put while loading
  }
};

export default AutoRedirect;