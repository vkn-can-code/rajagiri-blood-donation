// This file is src/pages/admin/RequestManagement.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllOpenRequests } from '../../services/publicService';
import {
  createBloodRequest,
  deleteBloodRequest,
  updateRequestStatus
} from '../../services/adminService';
import styles from './RequestManagement.module.css';
import { PlusCircle, Trash2, AlertCircle, Calendar, User, Phone, FileText, Search, Link as LinkIcon, Map as MapIcon } from 'lucide-react';
import CustomSelect from '../../components/common/CustomSelect';
import Swal from 'sweetalert2';

const RequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- Form State ---
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_age: '',
    hospital_name: '',
    required_blood_group: 'A+',
    units_required: 1,
    patient_id: '',
    reason: '',
    bystander_name: '',
    bystander_number: '',
    required_date: new Date().toISOString().split('T')[0], // Default today
    google_maps_link: ''
  });

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllOpenRequests();
      setRequests(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData
      };

      await createBloodRequest(payload);

      await Swal.fire({
        title: 'Success!',
        text: 'Blood request created successfully.',
        icon: 'success',
        confirmButtonColor: 'var(--primary)'
      });

      // Reset form
      setFormData({
        patient_name: '',
        patient_age: '',
        hospital_name: '',
        required_blood_group: 'A+',
        units_required: 1,
        patient_id: '',
        reason: '',
        bystander_name: '',
        bystander_number: '',
        required_date: new Date().toISOString().split('T')[0],
        google_maps_link: ''
      });

      fetchRequests();
    } catch (err) {
      setError(err.toString());
      Swal.fire('Error', err.response?.data?.message || 'Failed to create request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Delete this request?')) {
      try {
        await deleteBloodRequest(requestId);
        fetchRequests();
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateRequestStatus(requestId, newStatus);
      fetchRequests();
    } catch (err) {
      setError(err.toString());
    }
  };

  // Helper to open Google Maps for existing requests
  const openGoogleMaps = (link) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      alert("Link not available for this request.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Blood Request Management</h1>

      {error && <div className={styles.messageError}>{error}</div>}

      {/* --- Create Request Form --- */}
      <form onSubmit={handleCreate} className={styles.adminForm}>
        <h3><PlusCircle size={24} /> Create New Request</h3>

        <div className={styles.formGrid}>
          {/* Section 1: Patient Details */}
          <div className={styles.formGroup}>
            <label>Patient Name</label>
            <input
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              placeholder="e.g. Moosakutty Hydrose"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Patient ID</label>
            <input
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              placeholder="e.g. 123940"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Patient Age</label>
            <input
              type="number"
              name="patient_age"
              value={formData.patient_age}
              onChange={handleChange}
              placeholder="e.g. 45"
              min="0"
              max="120"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Required Date</label>
            <input
              type="date"
              name="required_date"
              value={formData.required_date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Section 2: Medical Requirements */}
          {/* Section 2: Medical Requirements */}
          <div className={styles.formGroup}>
            <label>Blood Group</label>
            <CustomSelect
              name="required_blood_group"
              value={formData.required_blood_group}
              onChange={val => {
                setFormData(prev => ({ ...prev, required_blood_group: val }));
              }}
              options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => ({ label: g, value: g }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Units Required</label>
            <input
              type="number"
              name="units_required"
              value={formData.units_required}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Reason / Case</label>
            <input
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g. Accident, Surgery"
            />
          </div>

          {/* Section 3: Hospital & Bystander */}
          <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
            <label>Hospital Name</label>
            <input
              name="hospital_name"
              value={formData.hospital_name}
              onChange={handleChange}
              placeholder="e.g. Lakeshore Hospital Eranakulam"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Bystander Name</label>
            <input
              name="bystander_name"
              value={formData.bystander_name}
              onChange={handleChange}
              placeholder="e.g. Minhaj"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Bystander Number</label>
            <input
              type="tel"
              name="bystander_number"
              value={formData.bystander_number}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              pattern="[0-9]{10}"
              maxLength="10"
              minLength="10"
              title="Phone number must be exactly 10 digits"
            />
          </div>
        </div>

        {/* --- MAP LINK SECTION --- */}
        <div className={styles.mapSection} style={{ border: 'none', padding: '0', background: 'transparent' }}>
          <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
            <label>Google Maps Link (Optional)</label>
            <input
              name="google_maps_link"
              value={formData.google_maps_link}
              onChange={handleChange}
              placeholder="Paste Google Maps link here..."
            />
          </div>
        </div>

        <button type="submit" className={styles.formButton} disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish Request'}
        </button>
      </form>

      {/* --- Request List --- */}
      <div className={styles.listContainer}>
        <h3>Active Requests ({requests.length})</h3>
        {isLoading ? <p style={{ padding: '2rem' }}>Loading requests...</p> : (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient Details</th>
                <th>Hospital & Reason</th>
                <th>Requirement</th>
                <th>Bystander</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555' }}>
                      <Calendar size={14} />
                      {new Date(req.required_date || req.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1e293b' }}>
                      {req.patient_name} <span style={{ fontWeight: 'normal', fontSize: '0.85rem', color: '#666' }}>({req.patient_age ? `${req.patient_age} yrs` : 'N/A'})</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={12} /> ID: {req.patient_id || '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#334155' }}>
                      {req.hospital_name}
                      {/* Map Link */}
                      {req.google_maps_link && (
                        <button
                          onClick={() => openGoogleMaps(req.google_maps_link)}
                          className={styles.inlineMapBtn}
                          title="View Location"
                        >
                          <MapIcon size={14} />
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '2px' }}>
                      {req.reason ? `(${req.reason})` : ''}
                    </div>
                  </td>
                  <td>
                    <span className={styles.bloodBadge}>{req.required_blood_group}</span>
                    <span style={{ marginLeft: '8px', fontWeight: '600', color: '#334155' }}>{req.units_required} Units</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} color="#64748b" /> {req.bystander_name || '-'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                      <Phone size={12} /> {req.bystander_number || '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ width: '130px' }}>
                      <CustomSelect
                        value={req.status}
                        onChange={(val) => handleStatusChange(req.id, val)}
                        options={[
                          { label: "Open", value: "open" },
                          { label: "Fulfilled", value: "fulfilled" },
                          { label: "Closed", value: "closed" }
                        ]}
                      />
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(req.id)}
                      className={styles.deleteButton}
                      title="Delete Request"
                    >
                      <Trash2 size={18} />
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

export default RequestManagement;
