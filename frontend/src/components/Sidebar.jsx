// This file is src/components/Sidebar.jsx

import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './DashboardLayout.module.css';

// Import icons
import {
  LayoutGrid,
  Users,
  BookUser,
  ClipboardCheck,
  GraduationCap,
  HeartHandshake,
  FileText,
  Building,
  User,
  LogOut,
  Shield, // Super Admin Privileges
  History as HistoryIcon, // New History Icon
  Mail, // New Contact Icon
  Settings, // System Settings Icon
  Activity // User Analytics Icon
} from 'lucide-react';

// Helper component for links
const SidebarLink = ({ to, icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
    }
  >
    {icon}
    <span>{children}</span>
  </NavLink>
);

const Sidebar = ({ isSidebarOpen, onLinkClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // Helper to check if user has ANY admin privileges
  const isAdminAccess = user.role === 'admin' || user.role === 'super_admin';

  // Granular permission checks (optional visual hiding)
  const canManageUsers = user.role === 'super_admin' || (user.role === 'admin' && user.permissions?.manage_users !== false);
  // Note: We default to showing links if permission is undefined, 
  // assuming the backend enforces the actual security.

  return (
    <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>

      {/* Brand Header */}
      <div className={styles.sidebarHeader}>
        <Link to="/dashboard" className={styles.sidebarBrand}>
          <div className={styles.acronymWrapper}>
            {/* R -> Rajagiri (Green) */}
            <div className={`${styles.letterGroup} ${styles.greenTheme}`}>
              <span className={styles.initial}>R</span>
              <span className={styles.fullText}>ajagiri</span>
            </div>

            <div className={styles.spacer}></div>

            {/* L -> Leading (Black) */}
            <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
              <span className={styles.initial}>L</span>
              <span className={styles.fullText}>eading</span>
            </div>

            {/* Y -> Youth (Black) */}
            <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
              <span className={styles.initial}>Y</span>
              <span className={styles.fullText}>outh</span>
            </div>

            {/* F -> For (Black) */}
            <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
              <span className={styles.initial}>F</span>
              <span className={styles.fullText}>or</span>
            </div>

            {/* E -> Empowerment (Black) */}
            <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
              <span className={styles.initial}>E</span>
              <span className={styles.fullText}>mpowerment</span>
            </div>
          </div>
        </Link>
      </div>

      <nav className={styles.sidebarNav} onClick={onLinkClick}>

        {/* --- COMMON LINKS (Everyone) --- */}
        <SidebarLink to="/dashboard" icon={<LayoutGrid size={20} />}>Dashboard</SidebarLink>
        <SidebarLink to="/profile" icon={<User size={20} />}>My Profile</SidebarLink>
        <SidebarLink to="/requests" icon={<HeartHandshake size={20} />}>Urgent Requests</SidebarLink>
        <SidebarLink to="/camps" icon={<Building size={20} />}>Blood Camps</SidebarLink>
        <SidebarLink to="/contact" icon={<Mail size={20} />}>Contact Us</SidebarLink>

        {/* --- ADMIN SECTION --- */}
        {isAdminAccess && (
          <>
            {/* 1. Users & Academics */}
            <div className={styles.sidebarSectionTitle}>Organization</div>

            {/* User Management */}
            {(user.role === 'super_admin' || user.permissions?.manage_users === true) && (
              <>
                <SidebarLink to="/admin/users" icon={<Users size={20} />}>User Management</SidebarLink>
                <SidebarLink to="/admin/user-analytics" icon={<Activity size={20} />}>User Analytics</SidebarLink>
              </>
            )}

            {/* Department Management */}
            {(user.role === 'super_admin' || user.permissions?.manage_departments === true) && (
              <SidebarLink to="/admin/departments" icon={<Building size={20} />}>Departments</SidebarLink>
            )}

            {/* Batch Management */}
            {(user.role === 'super_admin' || user.permissions?.manage_batches === true) && (
              <SidebarLink to="/admin/batches" icon={<BookUser size={20} />}>Batch Management</SidebarLink>
            )}

            {/* 2. Operations */}
            <div className={styles.sidebarSectionTitle} style={{ marginTop: '15px' }}>Operations</div>

            {/* Request Management */}
            {(user.role === 'super_admin' || user.permissions?.manage_requests === true) && (
              <>
                <SidebarLink to="/admin/requests" icon={<ClipboardCheck size={20} />}>Request Management</SidebarLink>
                <SidebarLink to="/admin/request-list" icon={<HeartHandshake size={20} />}>Volunteer Responses</SidebarLink>
              </>
            )}

            {/* Camp Management */}
            {(user.role === 'super_admin' || user.permissions?.manage_camps === true) && (
              <SidebarLink to="/admin/camps" icon={<Building size={20} />}>Camp Management</SidebarLink>
            )}

            {/* 3. Communication */}
            <div className={styles.sidebarSectionTitle} style={{ marginTop: '15px' }}>Communication</div>

            {/* Email Management */}
            {(user.role === 'super_admin' || user.permissions?.manage_emails === true) && (
              <>
                <SidebarLink to="/admin/emails" icon={<Mail size={20} />}>
                  Email Management
                </SidebarLink>
                <SidebarLink to="/admin/pending-reminders" icon={<FileText size={20} />}>
                  Pending Reminders
                </SidebarLink>
              </>
            )}

            {/* 4. System & Security */}
            <div className={styles.sidebarSectionTitle} style={{ marginTop: '15px' }}>System</div>

            {/* System History */}
            {(user.role === 'super_admin' || user.permissions?.view_history === true) && (
              <SidebarLink to="/history" icon={<HistoryIcon size={20} />}>
                System History
              </SidebarLink>
            )}

            {/* Super Admin Exclusive Link */}
            {user.role === 'super_admin' && (
              <>
                <SidebarLink to="/admin/privileges" icon={<Shield size={20} />}>
                  Admin Privileges
                </SidebarLink>
                <SidebarLink to="/admin/settings" icon={<Settings size={20} />}>
                  System Settings
                </SidebarLink>
              </>
            )}
          </>
        )}

        {/* --- FACULTY ADMIN SECTION --- */}
        {(user.role === 'faculty_admin') && (
          <>
            <div className={styles.sidebarSectionTitle}>Faculty Admin</div>
            <SidebarLink to="/faculty_admin/my-class" icon={<GraduationCap size={20} />}>My Class</SidebarLink>
            <SidebarLink to="/faculty_admin/pending-donations" icon={<FileText size={20} />}>Approve Donations</SidebarLink>
            <SidebarLink to="/admin/request-list" icon={<HeartHandshake size={20} />}>View Responses</SidebarLink>

            {/* New History Link for Faculty */}
            <SidebarLink to="/history" icon={<HistoryIcon size={20} />}>
              Batch History
            </SidebarLink>
          </>
        )}

        {/* Regular Users (Students, Regular Faculty, Non-Teaching, Volunteers) */}
        {(user.role === 'student' || user.role === 'volunteer' || user.role === 'non_teaching' || user.role === 'faculty') && (
          <>
            <div className={styles.sidebarSectionTitle}>Member</div>
            <SidebarLink to="/student/my-donations" icon={<FileText size={20} />}>My Donations</SidebarLink>
          </>
        )}

      </nav>

      {/* --- Footer / Logout --- */}
      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;