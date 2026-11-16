import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../../services/adminService';
import Spinner from '../common/Spinner';
import styles from './UserAnalyticsIndex.module.css';

// Reuse palette for avatars and blood groups
const BLOOD_COLORS = {
  'A+': '#dc2626', 'A-': '#b91c1c',
  'B+': '#2563eb', 'B-': '#1d4ed8',
  'O+': '#059669', 'O-': '#047857',
  'AB+': '#7c3aed', 'AB-': '#6d28d9',
};
const AVATAR_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const bgColor = (bg) => BLOOD_COLORS[bg] || '#6b7280';

const ROLES = ['student', 'faculty', 'non_teaching', 'volunteer', 'faculty_admin', 'admin', 'super_admin'];

const UserAnalyticsIndex = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [donorFilter, setDonorFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        u.name.toLowerCase().includes(q) || 
        (u.email || '').toLowerCase().includes(q);
        
      // 2. Role Filter
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      
      // 3. Blood Group Filter
      const matchesBlood = bloodGroupFilter === 'all' || u.blood_group === bloodGroupFilter;
      
      // 4. Donor Filter
      const matchesDonor = donorFilter === 'all' || 
        (donorFilter === 'donor' && u.has_donated) || 
        (donorFilter === 'non_donor' && !u.has_donated);

      return matchesSearch && matchesRole && matchesBlood && matchesDonor;
    });
  }, [users, searchQuery, roleFilter, bloodGroupFilter, donorFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setBloodGroupFilter('all');
    setDonorFilter('all');
  };

  const hasActiveFilters = searchQuery || roleFilter !== 'all' || bloodGroupFilter !== 'all' || donorFilter !== 'all';

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.pageWrap}>
      
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>User Analytics</h1>
          <p className={styles.pageSubtitle}>Select a user to view their complete activity timeline</p>
        </div>
      </div>

      {/* --- Advanced Filters Toolbar --- */}
      <div className={styles.filterToolbar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <select 
            className={styles.filterSelect} 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {ROLES.map(r => (
              <option key={r} value={r}>{r.replace('_', ' ')}</option>
            ))}
          </select>

          <select 
            className={styles.filterSelect} 
            value={bloodGroupFilter} 
            onChange={e => setBloodGroupFilter(e.target.value)}
          >
            <option value="all">All Blood Groups</option>
            {Object.keys(BLOOD_COLORS).map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <select 
            className={styles.filterSelect} 
            value={donorFilter} 
            onChange={e => setDonorFilter(e.target.value)}
          >
            <option value="all">All Donor Status</option>
            <option value="donor">Verified Donors</option>
            <option value="non_donor">Non-Donors</option>
          </select>

          {hasActiveFilters && (
            <button className={styles.clearBtn} onClick={clearFilters} title="Clear all filters">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className={styles.errorCard}>{error}</div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableHeaderRow}>
            <span className={styles.resultCount}>Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Blood Group</th>
                  <th>Donor Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className={styles.emptyState}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px', color: '#9ca3af' }}>
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <line x1="17" y1="8" x2="23" y2="14"></line>
                          <line x1="23" y1="8" x2="17" y2="14"></line>
                        </svg>
                        No users match your filters.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const ac = avatarColor(user.name);
                    return (
                      <tr 
                        key={user.id} 
                        className={styles.tableRow}
                        onClick={() => navigate(`/admin/users/${user.id}/analytics`)}
                      >
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.avatar} style={{ background: ac }}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className={styles.userName}>{user.name}</div>
                              <div className={styles.userEmail}>{user.email || 'No email provided'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={styles.roleTag}>{(user.role || '').replace('_', ' ')}</span>
                        </td>
                        <td>
                          {user.blood_group ? (
                            <span className={styles.bloodTag} style={{ background: bgColor(user.blood_group) }}>
                              {user.blood_group}
                            </span>
                          ) : (
                            <span className={styles.unspecified}>Unknown</span>
                          )}
                        </td>
                        <td>
                          {user.has_donated ? (
                            <span className={styles.donorPill}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              Verified Donor
                            </span>
                          ) : (
                            <span className={styles.nonDonorPill}>Non-Donor</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className={styles.viewBtn}>
                            View Analytics
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 18l6-6-6-6"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalyticsIndex;
