import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './UserManagement.module.css'; // Reuse existing styles
import { Shield, Check, X } from 'lucide-react';
import { showError } from '../../utils/swalUtils';

const AdminPrivileges = () => {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/admins');
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePermission = async (adminId, permKey) => {
    const admin = admins.find(a => a.id === adminId);
    const currentVal = admin.permissions ? admin.permissions[permKey] : false;

    const newPermissions = {
      ...admin.permissions,
      [permKey]: !currentVal
    };

    try {
      await api.put(`/admin/admins/${adminId}/permissions`, { permissions: newPermissions });
      // Optimistic Update
      setAdmins(admins.map(a => a.id === adminId ? { ...a, permissions: newPermissions } : a));
    } catch (err) {
      showError("Update Failed", "Failed to update permission");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Admin Privileges</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Control what other admins can access.
      </p>

      <div className={styles.listContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Admin Name</th>
              <th>User Mgmt</th>
              <th>Batch Mgmt</th>
              <th>Request Mgmt</th>
              <th>Camp Mgmt</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id}>
                <td>
                  <div style={{ fontWeight: 'bold' }}>{admin.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{admin.email}</div>
                </td>
                {['manage_users', 'manage_batches', 'manage_requests', 'manage_camps'].map(perm => (
                  <td key={perm}>
                    <button
                      onClick={() => togglePermission(admin.id, perm)}
                      style={{
                        background: 'none',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        color: admin.permissions?.[perm] ? 'var(--primary)' : '#b91c1c',
                        backgroundColor: admin.permissions?.[perm] ? '#f0fdf4' : '#fef2f2'
                      }}
                    >
                      {admin.permissions?.[perm] ? <Check size={16} /> : <X size={16} />}
                      {admin.permissions?.[perm] ? 'Allowed' : 'Locked'}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPrivileges;
