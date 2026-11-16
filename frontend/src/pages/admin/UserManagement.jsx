import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// We use the service functions directly to satisfy ESLint and cleaner logic
import {
  getAllUsers,
  getAllBatches,
  createUser,
  deleteUser
} from '../../services/adminService';
// We need raw API access for features not yet in adminService (import/full-edit)
import api from '../../services/api';
import styles from './UserManagement.module.css';
import Button from '../common/Button';
import CustomSelect from '../../components/common/CustomSelect';
import {
  Search,
  X,
  Save,
  Upload,
  UserPlus,
  FileSpreadsheet,
  Edit,
  Trash2
} from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../../utils/swalUtils';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [batchesList, setBatchesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs: 'manual' or 'import'
  const [activeTab, setActiveTab] = useState('manual');

  // --- Manual Create State ---
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('student');
  const [newBatchId, setNewBatchId] = useState('');
  const [newBloodGroup, setNewBloodGroup] = useState('');

  // --- Bulk Import State ---
  const [importFile, setImportFile] = useState(null);
  const [importRole, setImportRole] = useState('student');
  const [importBatch, setImportBatch] = useState('');

  // --- Edit State ---
  const [editingUser, setEditingUser] = useState(null); // ID of user being edited
  const [editForm, setEditForm] = useState({});

  // Pagination & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Derived filtered & paginated records
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [u, b] = await Promise.all([getAllUsers(), getAllBatches()]);
      setUsers(u);
      setBatchesList(b);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---

  const handleManualCreate = async (e) => {
    e.preventDefault();
    try {
      const emailLower = newEmail.toLowerCase();
      if (emailLower.endsWith('@gmail.com') && newRole !== 'admin') {
        return showError('Invalid Domain', 'Only Admins can use @gmail.com');
      }
      if (!emailLower.endsWith('@rajagiri.edu') && !emailLower.endsWith('@gmail.com')) {
        return showError('Invalid Domain', 'Email must end with @rajagiri.edu (or @gmail.com for Admins)');
      }

      const userData = {
        name: newName,
        email: newEmail,
        phone_number: newPhone,
        password: newPassword,
        role: newRole,
        blood_group: newBloodGroup,
        batch_id: newBatchId
      };
      // Use the service function
      const res = await createUser(userData);
      showSuccess('User Created', res.message);

      // Reset
      setNewName(''); setNewEmail(''); setNewPhone(''); setNewPassword('');
      setNewRole('student'); setNewBatchId(''); setNewBloodGroup('');
      fetchData();
    } catch (err) {
      showError('Creation Failed', err.message);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!importFile) return showError('Missing File', "Select a CSV file");

    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('defaultRole', importRole);
    if (importBatch) formData.append('defaultBatchId', importBatch);

    try {
      const res = await api.post('/admin/users/import', formData);
      showSuccess('Import Successful', res.data.message);
      setImportFile(null);
      fetchData();
    } catch (err) {
      showError("Import Failed", (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (userId) => {
    const confirmed = await showConfirm("Delete User?", "This action cannot be undone.", "Yes, delete!");
    if (!confirmed) return;
    try {
      // Use service function
      await deleteUser(userId);
      fetchData();
    } catch (err) {
      showError("Delete Failed", err.message);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setEditForm({
      ...user,
      password: '', // Empty by default for security
      batch_id: user.batch_id || user.StudentBatch?.id || '' // Handle null or nested object
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const emailLower = editForm.email.toLowerCase();
      if (emailLower.endsWith('@gmail.com') && editForm.role !== 'admin') {
        return showError('Invalid Domain', 'Only Admins can use @gmail.com');
      }
      if (!emailLower.endsWith('@rajagiri.edu') && !emailLower.endsWith('@gmail.com')) {
        return showError('Invalid Domain', 'Email must end with @rajagiri.edu (or @gmail.com for Admins)');
      }

      await api.put(`/admin/users/${editingUser}`, editForm);
      showSuccess('Updated', "User details updated successfully");
      setEditingUser(null);
      fetchData();
    } catch (err) {
      showError("Update Failed", (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>User Management</h1>

      {/* --- TABS --- */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('manual')}
          className={activeTab === 'manual' ? styles.tabActive : styles.tabInactive}
        >
          <UserPlus size={18} /> Manual Add
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={activeTab === 'import' ? styles.tabActive : styles.tabInactive}
        >
          <FileSpreadsheet size={18} /> Bulk Import
        </button>
      </div>

      {/* --- 1. MANUAL CREATE FORM --- */}
      {activeTab === 'manual' && (
        <div className={styles.adminForm}>
          <h3><UserPlus size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Create New User</h3>
          <form onSubmit={handleManualCreate} className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required pattern=".*@(rajagiri\.edu|gmail\.com)$" title="Must be a @rajagiri.edu or @gmail.com email address" />
            </div>
            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Role</label>
              <CustomSelect
                value={newRole}
                onChange={val => setNewRole(val)}
                options={[
                  { label: "Student", value: "student" },
                  { label: "Faculty", value: "faculty" },
                  { label: "Faculty Admin", value: "faculty_admin" },
                  { label: "Admin", value: "admin" }
                ]}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Blood Group</label>
              <CustomSelect
                value={newBloodGroup}
                onChange={val => setNewBloodGroup(val)}
                options={bloodGroups.map(bg => ({ label: bg, value: bg }))}
                placeholder="-- Select --"
              />
            </div>
            {newRole === 'student' && (
              <div className={styles.formGroup}>
                <label>Assign Batch</label>
                <CustomSelect
                  value={newBatchId}
                  onChange={val => setNewBatchId(val)}
                  options={batchesList.map(b => ({ label: b.batch_name, value: b.id }))}
                  placeholder="-- None --"
                />
              </div>
            )}
            <Button type="submit">Create User</Button>
          </form>
        </div>
      )}

      {/* --- 2. BULK IMPORT FORM --- */}
      {activeTab === 'import' && (
        <div className={styles.adminForm} style={{ borderColor: 'var(--primary)' }}>
          <h3><Upload size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Bulk Import via CSV</h3>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            CSV must have headers: <strong>Name, Email, Phone, BloodGroup, Password</strong>
          </p>
          <form onSubmit={handleBulkImport} className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Select File</label>
              <input type="file" accept=".csv" onChange={e => setImportFile(e.target.files[0])} />
            </div>
            <div className={styles.formGroup}>
              <label>Role for All</label>
              <CustomSelect
                value={importRole}
                onChange={val => setImportRole(val)}
                options={[
                  { label: "Student", value: "student" },
                  { label: "Faculty", value: "faculty" },
                  { label: "Faculty Admin", value: "faculty_admin" }
                ]}
              />
            </div>
            {importRole === 'student' && (
              <div className={styles.formGroup}>
                <label>Batch</label>
                <CustomSelect
                  value={importBatch}
                  onChange={val => setImportBatch(val)}
                  options={batchesList.map(b => ({ label: b.batch_name, value: b.id }))}
                  placeholder="-- None --"
                />
              </div>
            )}
            <Button type="submit">Upload & Process</Button>
          </form>
        </div>
      )}

      {/* --- 3. USER LIST (With Edit Modal Support) --- */}
      <div className={styles.listContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: 0, border: 'none', padding: 0 }}>All Users ({users.length})</h3>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 8px 8px 35px', borderRadius: '20px', border: '1px solid #ccc' }} 
            />
          </div>
        </div>

        {isLoading ? <p style={{ padding: '2rem' }}>Loading...</p> : (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Blood Group</th>
                <th>Department / Batch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => {
                let deptInfo = '-';
                if (user.role === 'student' && user.StudentBatch) {
                  const deptName = user.StudentBatch.Department?.name || 'No Dept';
                  deptInfo = `${deptName} - ${user.StudentBatch.batch_name}`;
                } else if (user.role === 'faculty' && user.HeadedDepartments && user.HeadedDepartments.length > 0) {
                  deptInfo = user.HeadedDepartments.map(d => `Head of ${d.name}`).join(', ');
                }

                return (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone_number}</td>
                    <td>
                      {user.role === 'admin' || user.role === 'super_admin' ? (
                        <span className={styles.badgeAdmin}>Admin</span>
                      ) : user.role === 'faculty_admin' ? (
                        <span className={styles.badgeFaculty}>Faculty Admin</span>
                      ) : (
                        <span className={styles.badgeUser}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td>{user.blood_group || '-'}</td>
                    <td style={{ fontSize: '0.85rem', color: '#555' }}>
                        {user.role === 'faculty_admin' && user.HeadedDepartments && user.HeadedDepartments.length > 0 ? 
                            user.HeadedDepartments.map(d => d.name).join(', ') : deptInfo}
                    </td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}/analytics`)}
                        className={styles.iconButton}
                        title="View Analytics"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="20" x2="18" y2="10" />
                          <line x1="12" y1="20" x2="12" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditClick(user)}
                        className={styles.iconButton}
                        title="Edit"
                      >
                        <Edit size={18} color="var(--primary)" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className={styles.iconButton}
                        title="Delete"
                      >
                        <Trash2 size={18} color="#b91c1c" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', color: '#555' }}>Items per page:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: currentPage === 1 ? '#f5f5f5' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.9rem', color: '#555' }}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: currentPage === totalPages ? '#f5f5f5' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- 4. EDIT MODAL OVERLAY --- */}
      {editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Edit User</h3>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} style={{ display: 'grid', gap: '1rem' }}>
              <input className={styles.modalInput} placeholder="Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              <input className={styles.modalInput} type="email" placeholder="Email (@rajagiri.edu)" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required pattern=".*@(rajagiri\.edu|gmail\.com)$" title="Must be a @rajagiri.edu or @gmail.com email address" />
              <input className={styles.modalInput} placeholder="Phone" value={editForm.phone_number} onChange={e => setEditForm({ ...editForm, phone_number: e.target.value })} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <CustomSelect
                  value={editForm.role}
                  onChange={val => setEditForm(prev => ({ ...prev, role: val }))}
                  options={[
                    { label: "Student", value: "student" },
                    { label: "Faculty", value: "faculty" },
                    { label: "Faculty Admin", value: "faculty_admin" },
                    { label: "Admin", value: "admin" }
                  ]}
                />
                <CustomSelect
                  value={editForm.blood_group || ''}
                  onChange={val => setEditForm(prev => ({ ...prev, blood_group: val }))}
                  options={bloodGroups.map(bg => ({ label: bg, value: bg }))}
                  placeholder="Blood Group"
                />
              </div>

              {editForm.role === 'student' && (
                <div style={{ marginTop: '1rem' }}>
                  <CustomSelect
                    value={editForm.batch_id || ''}
                    onChange={val => setEditForm(prev => ({ ...prev, batch_id: val }))}
                    options={batchesList.map(b => ({ label: b.batch_name, value: b.id }))}
                    placeholder="Assign Batch..."
                  />
                </div>
              )}

              <input className={styles.modalInput} type="password" placeholder="New Password (leave blank to keep)" onChange={e => setEditForm({ ...editForm, password: e.target.value })} />

              <Button type="submit"><Save size={18} style={{ marginRight: '8px' }} /> Save Changes</Button>
            </form>
          </div>
        </div>
      )}
    </div >
  );
};

export default UserManagement;
