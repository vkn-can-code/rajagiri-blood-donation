// src/pages/faculty/MyClass.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getMyClass,
  addStudentToClass,
  removeStudentFromClass,
  importStudents
} from '../../services/facultyService';
import styles from './MyClass.module.css';
import Button from '../common/Button';
import { UserPlus, FileSpreadsheet, Trash2, Users, Search, ChevronRight, Upload, ChevronLeft, AlertCircle } from 'lucide-react';
import Spinner from '../common/Spinner';

const MyClass = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const initialTab = params.get('tab') === 'import' ? 'import' : 'manual';

  const [batch, setBatch] = useState(null); // The display batch metadata
  const [allBatches, setAllBatches] = useState([]); // All authorized batches
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Pagination & Search & Batch State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedBatchId, setSelectedBatchId] = useState('all');
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 0 });

  // Manual Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Import State
  const [importFile, setImportFile] = useState(null);

  // Debounce search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchMyClass = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyClass(page, limit, debouncedSearch, selectedBatchId);
      setBatch(data.batch);
      setAllBatches(data.allBatches || []);
      
      // If backend overrides selectedBatchId (e.g. only 1 batch exists), update it silently
      if (data.selectedBatchId && data.selectedBatchId !== selectedBatchId && selectedBatchId === 'all') {
         setSelectedBatchId(data.selectedBatchId.toString());
      }

      setStudents(data.students);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedBatchId]);

  useEffect(() => {
    fetchMyClass();
  }, [fetchMyClass]);

  // Form specific target batch
  const [formBatchId, setFormBatchId] = useState('');

  // Synchronize formBatchId with selectedBatchId if it's a specific batch
  useEffect(() => {
    if (selectedBatchId !== 'all') {
      setFormBatchId(selectedBatchId);
    }
  }, [selectedBatchId]);

  // Handle batch selection change
  const handleBatchChange = (e) => {
    setSelectedBatchId(e.target.value);
    setPage(1); // Reset to page 1 when changing batch
  };

  // --- Handlers ---
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const targetBatchId = allBatches.length === 1 ? allBatches[0].id : formBatchId;
    if (!targetBatchId) return setError("Please select a target batch for the student.");
    setError(null); setMessage(null);
    try {
      const result = await addStudentToClass({
        name: newName,
        email: newEmail,
        phone_number: newPhone,
        password: newPassword,
        batch_id: targetBatchId
      });
      setMessage(result.message);
      setNewName(''); setNewEmail(''); setNewPhone(''); setNewPassword('');
      fetchMyClass();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    const targetBatchId = allBatches.length === 1 ? allBatches[0].id : formBatchId;
    if (!targetBatchId) return setError("Please select a target batch for the import.");
    if (!importFile) return setError("Please select a CSV file.");

    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('batch_id', targetBatchId);

    try {
      const res = await importStudents(formData);
      setMessage(res.message);
      setImportFile(null);
      fetchMyClass();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student from class?')) return;
    try {
      const result = await removeStudentFromClass(studentId);
      setMessage(result.message);
      fetchMyClass();
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper for Avatar
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST';
  };

  if (isLoading && !batch) return <div style={{ marginTop: '5rem' }}><Spinner /></div>;

  const isAllBatches = selectedBatchId === 'all';

  return (
    <div className={styles.pageContainer}>

      {/* HEADER */}
      <div className={styles.headerCluster}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.pageTitle}>Class Management</h1>
            <div className={styles.subTitle}>Manage roster, add students, and track attendance.</div>
          </div>
          
          {/* Batch Selector Dropdown */}
          {allBatches.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Select Batch:</label>
              <select 
                value={selectedBatchId} 
                onChange={handleBatchChange}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  color: '#1e293b',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <option value="all">All Assigned Batches</option>
                {allBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.batch_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {batch && (
          <div className={styles.batchInfoCard}>
            <div>
              <h2 className={styles.batchName}>{batch.batch_name}</h2>
              <p className={styles.batchDetails}>
                {batch.department || 'Department View'} {batch.current_semester ? `• Sem ${batch.current_semester}` : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {message && <div className={styles.messageSuccess}>{message}</div>}
      {error && <div className={styles.messageError}>{error}</div>}

      <div className={styles.contentGrid}>

        {/* --- LEFT: ACTIONS PANEL --- */}
        <div className={styles.formContainer}>
          <div className={styles.tabContainer}>
            <button
              onClick={() => setActiveTab('manual')}
              className={`${styles.tabButton} ${activeTab === 'manual' ? styles.tabActive : ''}`}
            >
              <UserPlus size={16} /> Manual
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`${styles.tabButton} ${activeTab === 'import' ? styles.tabActive : ''}`}
            >
              <FileSpreadsheet size={16} /> Import
            </button>
          </div>

          {/* Manual Form */}
          {activeTab === 'manual' && (
            <form onSubmit={handleAddStudent} className={styles.adminForm}>
              <h3 className={styles.containerTitle}>New Student Details</h3>
              {allBatches.length > 1 && (
                <div className={styles.formGroup}>
                  <label>Target Batch</label>
                  <select value={formBatchId} onChange={(e) => setFormBatchId(e.target.value)} required>
                    <option value="">Select a batch...</option>
                    {allBatches.map(b => (
                      <option key={b.id} value={b.id}>{b.batch_name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="e.g. John Doe" />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="john@example.com" />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required placeholder="+91 99999 99999" />
              </div>
              <div className={styles.formGroup}>
                <label>Default Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength="6" placeholder="******" />
              </div>
              <Button type="submit" fullWidth>Add Student</Button>
            </form>
          )}

          {/* Import Form */}
          {activeTab === 'import' && (
            <form onSubmit={handleBulkImport} className={styles.adminForm}>
              <h3 className={styles.containerTitle}>Upload CSV</h3>
              {allBatches.length > 1 && (
                <div className={styles.formGroup}>
                  <label>Target Batch</label>
                  <select value={formBatchId} onChange={(e) => setFormBatchId(e.target.value)} required>
                    <option value="">Select a batch...</option>
                    {allBatches.map(b => (
                      <option key={b.id} value={b.id}>{b.batch_name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ 
                background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', 
                border: '1px dashed #cbd5e1', textAlign: 'center'
              }}>
                <Upload size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Drag and drop your CSV here,<br /> or click to browse.
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  style={{ marginTop: '0.5rem' }}
                  required
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                <strong>Columns:</strong> Name, Email, Phone, BloodGroup (opt)
              </p>
              <Button type="submit" fullWidth>Import Roster</Button>
            </form>
          )}
        </div>

        {/* --- RIGHT: STUDENT LIST --- */}
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <h3 className={styles.containerTitle}>
              <Users size={20} /> Student Roster <span style={{ color: '#94a3b8', marginLeft: '8px' }}>({pagination.totalItems || 0})</span>
            </h3>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search students..."
                className={styles.searchBar}
                style={{ paddingLeft: '32px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact Info</th>
                  <th>Batch / Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}><Spinner /></td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No students found matching your search.</td></tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className={styles.studentName}>
                          <div className={styles.avatar}>{getInitials(student.name)}</div>
                          <div>
                            <div>{student.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: #{student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem', color: '#334155' }}>{student.email}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.phone_number}</div>
                      </td>
                      <td>
                        <span style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {student.StudentBatch ? student.StudentBatch.batch_name : 'Assigned'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => navigate(`/admin/users/${student.id}/analytics`)}
                            title="View Analytics"
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '8px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              color: '#1d4ed8',
                              transition: 'background 0.15s'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="20" x2="18" y2="10" />
                              <line x1="12" y1="20" x2="12" y2="4" />
                              <line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                            Analytics
                          </button>
                          <button onClick={() => handleRemoveStudent(student.id)} className={styles.deleteButton} title="Remove Student">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', backgroundColor: '#fff', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: page === 1 ? '#f8fafc' : 'white', color: page === 1 ? '#94a3b8' : '#1e293b', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                Page {page} of {pagination.totalPages}
              </span>
              
              <button 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: page === pagination.totalPages ? '#f8fafc' : 'white', color: page === pagination.totalPages ? '#94a3b8' : '#1e293b', cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MyClass;