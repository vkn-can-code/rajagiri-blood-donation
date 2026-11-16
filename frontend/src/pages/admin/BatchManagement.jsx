import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './BatchManagement.module.css';
import { Trash2 } from 'lucide-react';
import CustomSelect from '../../components/common/CustomSelect';

import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmationContext';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null); // tracks which batch is being saved

  // Global UI
  const toast = useToast();
  const confirm = useConfirm();

  // Form State
  const [batchName, setBatchName] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [batchRes, deptRes, userRes] = await Promise.all([
        api.get('/admin/batches'),
        api.get('/admin/departments'),
        api.get('/admin/users')
      ]);
      setBatches(batchRes.data);
      setDepartments(deptRes.data);
      // Filter only faculty and faculty_admin roles
      const faculty = userRes.data.filter(u =>
        u.role === 'faculty' || u.role === 'faculty_admin'
      );
      setFacultyList(faculty);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    try {
      await api.post('/admin/batches', {
        batch_name: batchName,
        department_id: selectedDept
      });
      toast.success('Batch created successfully!');
      setBatchName('');
      setSelectedDept('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create batch.');
    }
  };

  const handleDelete = async (batchId) => {
    const isConfirmed = await confirm({
      title: 'Delete Batch',
      message: 'Are you sure you want to delete this batch? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await api.delete(`/admin/batches/${batchId}`);
      toast.success('Batch deleted successfully');
      loadData();
    } catch (err) {
      toast.error("Failed to delete: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAssignTutor = async (batchId, facultyId) => {
    setAssigningId(batchId);
    try {
      const res = await api.put(`/admin/batches/${batchId}/assign-tutor`, {
        facultyId: facultyId || null
      });
      toast.success(res.data.message || 'Class tutor updated.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign tutor.');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Batch Management</h2>

      {/* Create Batch */}
      <div className={styles.card}>
        <h3>Create New Batch</h3>
        <form onSubmit={handleCreateBatch} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Batch Name</label>
            <input
              type="text"
              value={batchName}
              onChange={e => setBatchName(e.target.value)}
              placeholder="e.g. CS 2024"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Department</label>
            <CustomSelect
              options={departments.map(d => ({ label: d.name, value: d.id }))}
              value={selectedDept}
              onChange={val => setSelectedDept(val)}
              placeholder="-- Select Department --"
            />
          </div>

          <button type="submit" className={styles.btn}>Create Batch</button>
        </form>
      </div>

      {/* List Batches */}
      <div className={styles.list}>
        <h3>Current Batches</h3>
        {loading ? <p>Loading...</p> : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Batch Name</th>
                <th>Department</th>
                <th>Class Tutor</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(batch => (
                <tr key={batch.id}>
                  <td>{batch.batch_name}</td>
                  <td>{batch.Department?.name || '-'}</td>
                  <td style={{ minWidth: '210px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        key={batch.class_tutor_id} // re-render when data refreshes
                        defaultValue={batch.class_tutor_id || ''}
                        onChange={e => handleAssignTutor(batch.id, e.target.value || null)}
                        disabled={assigningId === batch.id}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.85rem',
                          color: batch.class_tutor_id ? '#0f172a' : '#94a3b8',
                          background: '#f8fafc',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">— Unassigned —</option>
                        {facultyList.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.role.replace(/_/g, ' ')})
                          </option>
                        ))}
                      </select>
                      {assigningId === batch.id && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Saving…</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {batch.Students ? batch.Students.length : 0}
                  </td>
                  <td>
                    <button
                      className={styles.iconButton}
                      onClick={() => handleDelete(batch.id)}
                      title="Delete Batch"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} color="#b91c1c" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BatchManagement;