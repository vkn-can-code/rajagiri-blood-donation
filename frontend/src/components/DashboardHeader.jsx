// This file is src/components/DashboardHeader.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // --- FIX: Import useNavigate
import { useAuth } from '../hooks/useAuth';
import styles from './DashboardLayout.module.css';
import { User, LogOut, Menu, X, Bell, Home } from 'lucide-react';

const DashboardHeader = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // --- FIX: Initialize hook
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- FIX: Handle Logout ---
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      {/* Mobile Sidebar Toggle */}
      <button className={styles.mobileToggle} onClick={onToggleSidebar}>
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Spacer */}
      <div className={styles.headerSpacer} />

      {/* Home Button */}
      <Link to="/" className={styles.profileButton} style={{ marginRight: '0.5rem' }} title="Go to Home Page">
        <Home size={20} />
      </Link>

      {/* Notification Bell */}
      <Link to="/notifications" className={styles.profileButton} style={{ marginRight: '0.5rem' }} title="Notifications">
        <Bell size={20} />
      </Link>

      {/* Profile Dropdown */}
      <div className={styles.profileMenu} ref={dropdownRef}>
        <button 
          className={styles.profileButton} 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span>Hi, {user?.name || 'User'}</span>
          <User size={20} />
        </button>

        {isDropdownOpen && (
          <div className={styles.profileDropdown}>
            <Link 
              to="/profile" 
              className={styles.dropdownLink} 
              onClick={() => setIsDropdownOpen(false)}
            >
              <User size={16} /> My Profile
            </Link>
            
            {/* Use the new handleLogout function */}

          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;