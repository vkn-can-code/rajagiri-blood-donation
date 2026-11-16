// src/pages/faculty/FacultyDashboard.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyClass,
  getPendingDonations,
  getWillingDonors
} from "../../services/facultyService";
import { useAuth } from "../../hooks/useAuth";
import {
  Users,
  FileText,
  Layers,
  ClipboardList,
  BarChart2,
  Shield,
  Zap,
  Activity,
  ChevronRight,
  Clock
} from "lucide-react";

import Spinner from "../common/Spinner";
import styles from "./FacultyDashboard.module.css";

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingCertificates: 0,
    currentSemester: "-",
    rejectedCount: 0 // Mock or derive if available
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [willingDonors, setWillingDonors] = useState([]);

  /* -------------------------------------------------
     FETCH DASHBOARD DATA
  -------------------------------------------------- */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [classData, pendingData, willingData] = await Promise.all([
          getMyClass(),            // { students:[], batch:{current_semester} }
          getPendingDonations(),    // [ ...pending certificates ]
          getWillingDonors()       // [ ...willing donors ]
        ]);

        setStats({
          totalStudents: classData?.students?.length || 0,
          pendingCertificates: pendingData?.length || 0,
          currentSemester: classData?.batch?.current_semester || "-",
          rejectedCount: 0 // Placeholder as API doesn't return this yet
        });

        // Mocking 'Recent Activity' based on pending data for now
        // In real app, fetch "Logs" or "History"
        const recent = pendingData?.slice(0, 5).map(d => ({
          id: d.id,
          user: d.User?.name || 'Student',
          action: 'uploaded a certificate',
          time: new Date(d.createdAt).toLocaleDateString()
        })) || [];

        setRecentActivities(recent);
        setWillingDonors(willingData || []);

      } catch (err) {
        setError(err.message || "Failed to load faculty dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading || !user) return <Spinner />;

  return (
    <div className={styles.dashboardContainer}>

      {/* ------------------------------------
          HERO SECTION
      ------------------------------------ */}
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.welcomeBadge}>Faculty Portal</span>
          <h1 className={styles.heroTitle}>Welcome, {user.name.split(' ')[0]}</h1>
          <p className={styles.heroSubtitle}>
            Manage your department's blood donation activities, approve requests, and track student progress all in one place.
          </p>
        </div>
        <div className={styles.heroDecoration}></div>
        {/* Abstract 3D-like Icon or Illustration could go here */}
        <Shield size={180} strokeWidth={0.5} color="#b11d24" style={{ opacity: 0.08, transform: 'rotate(-15deg)' }} />
      </header>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* ------------------------------------
          STATS GRID
      ------------------------------------ */}
      <section className={styles.statsGrid}>

        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.blueIcon}`}>
            <Users size={28} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.totalStudents}</span>
            <span className={styles.statLabel}>Total Students</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.orangeIcon}`}>
            <ClipboardList size={28} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.pendingCertificates}</span>
            <span className={styles.statLabel}>Pending Approvals</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.greenIcon}`}>
            <Layers size={28} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.currentSemester}</span>
            <span className={styles.statLabel}>Current Semester</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.redIcon}`}>
            <Activity size={28} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>Active</span>
            <span className={styles.statLabel}>Department Status</span>
          </div>
        </div>

      </section>

      {/* ------------------------------------
          MAIN CONTENT SPLIT
      ------------------------------------ */}
      <div className={styles.mainSplit}>

        {/* LEFT: QUICK ACTIONS */}
        <section>
          <div className={styles.actionsHeader}>
            <Zap size={24} color="#f59e0b" fill="#f59e0b" />
            Quick Management
          </div>
          <div className={styles.actionsGrid}>

            <Link to="/faculty_admin/pending-donations" className={styles.actionCard}>
              <div>
                <div className={styles.actionIcon}><FileText size={24} /></div>
                <h3 className={styles.actionTitle}>Approve Donations</h3>
                <p className={styles.actionDesc}>Review pending certificates from students.</p>
              </div>
              <ChevronRight size={20} color="#ccc" style={{ alignSelf: 'flex-end' }} />
            </Link>

            <Link to="/faculty_admin/my-class" className={styles.actionCard}>
              <div>
                <div className={styles.actionIcon}><Users size={24} /></div>
                <h3 className={styles.actionTitle}>Class Roster</h3>
                <p className={styles.actionDesc}>View students, add/remove, and promote.</p>
              </div>
              <ChevronRight size={20} color="#ccc" style={{ alignSelf: 'flex-end' }} />
            </Link>

            <Link to="/faculty_admin/my-class?tab=import" className={styles.actionCard}>
              <div>
                <div className={styles.actionIcon}><Layers size={24} /></div>
                <h3 className={styles.actionTitle}>Bulk Import</h3>
                <p className={styles.actionDesc}>Upload CSV to onboard batches quickly.</p>
              </div>
              <ChevronRight size={20} color="#ccc" style={{ alignSelf: 'flex-end' }} />
            </Link>

            {/* Placeholder for Analytics */}
            <div className={styles.actionCard} style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              <div>
                <div className={styles.actionIcon}><BarChart2 size={24} /></div>
                <h3 className={styles.actionTitle}>Analytics</h3>
                <p className={styles.actionDesc}>Detailed insights coming soon.</p>
              </div>
            </div>

          </div>
        </section>

        {/* RIGHT: RECENT ACTIVITY */}
        <section className={styles.activitySection}>
          <div className={styles.actionsHeader} style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            <Clock size={20} /> Recent Activity
          </div>

          <div className={styles.activityList}>
            {recentActivities.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>No recent activity.</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityAvatar}>
                    {act.user.charAt(0)}
                  </div>
                  <div className={styles.activityContent}>
                    <strong>{act.user}</strong>
                    <span>{act.action} - {act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>

      {/* ------------------------------------
          WILLING DONORS TABLE
      ------------------------------------ */}
      <section style={{ marginTop: '2rem', background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.8rem' }}>
          <Activity size={24} color="#dc2626" style={{ marginRight: '10px' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#1e293b', margin: 0 }}>Class Volunteers</h2>
        </div>

        {(!Array.isArray(willingDonors) || willingDonors.length === 0) ? (
          <p style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
            No students have volunteered for blood requests yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.9rem' }}>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Student Name</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Blood Group</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Phone</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Patient</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Requested Group</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Date Volunteered</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Status & Reason</th>
                </tr>
              </thead>
              <tbody>
                {willingDonors.map((donor) => {
                  if (!donor) return null;
                  return (
                    <tr key={donor.id || Math.random()} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', color: '#334155', fontWeight: '500' }}>{donor.User?.name || 'Unknown'}</td>
                      <td style={{ padding: '12px', color: '#dc2626', fontWeight: 'bold' }}>{donor.User?.blood_group || '-'}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{donor.User?.phone_number || '-'}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>
                        {donor.BloodRequest?.patient_name || 'Unknown Patient'} <br />
                        <small style={{ color: '#94a3b8' }}>{donor.BloodRequest?.hospital_name || ''}</small>
                      </td>
                      <td style={{ padding: '12px', color: '#dc2626' }}>{donor.BloodRequest?.required_blood_group || '-'}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>
                        {donor.createdAt ? new Date(donor.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: donor.status === 'rejected' ? '#ef4444' : (donor.status === 'accepted' ? 'var(--primary)' : '#3b82f6'),
                          backgroundColor: donor.status === 'rejected' ? '#fef2f2' : (donor.status === 'accepted' ? '#ecfdf5' : '#eff6ff'),
                          marginBottom: '4px'
                        }}>
                          {(donor.status || 'unknown').toUpperCase()}
                        </span>
                        {donor.reason && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>
                            {donor.reason}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};

export default FacultyDashboard;
