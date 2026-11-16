import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCamps } from '../../services/publicService';
import { createCamp, deleteCamp, updateCamp } from '../../services/adminService';
import styles from './CampManagement.module.css';
import {
  Edit,
  Trash2,
  Save,
  X,
  PlusCircle,
  Search,
  Calendar,
  MapPin,
  Clock,
  Eye
} from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../../utils/swalUtils';

const CampManagement = () => {
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Pagination & Search State ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // --- Create Form State ---
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [campDate, setCampDate] = useState('');
  const [gmapsLink, setGmapsLink] = useState('');

  // --- Edit State ---
  const [editingCamp, setEditingCamp] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchCamps = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllCamps(page, limit, searchQuery);
      // The API now returns { camps, totalPages, currentPage, totalItems }
      if (data && data.camps) {
        setCamps(data.camps);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
      } else {
        // Fallback if backend isn't updated yet or returns array directly
        setCamps(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery]);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  // --- Handlers ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on search
    fetchCamps();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const campData = { title, location, address, camp_date: campDate, google_maps_link: gmapsLink };
      await createCamp(campData);
      showSuccess('Camp Schedule', 'Camp created successfully!');
      setTitle(''); setLocation(''); setAddress(''); setCampDate(''); setGmapsLink('');
      fetchCamps();
    } catch (err) {
      showError('Creation Failed', err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Delete Camp?", "This action cannot be undone.", "Yes, delete!");
    if (!confirmed) return;
    try {
      await deleteCamp(id);
      fetchCamps();
    } catch (err) {
      showError('Delete Failed', err.message);
    }
  };

  const startEdit = (camp) => {
    setEditingCamp(camp.id);
    const date = new Date(camp.camp_date);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    setEditForm({
      ...camp,
      camp_date: date.toISOString().slice(0, 16)
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCamp(editingCamp, editForm);
      showSuccess('Updated', 'Camp updated successfully!');
      setEditingCamp(null);
      fetchCamps();
    } catch (err) {
      showError('Update Failed', err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Camp Management</h1>
        <p className={styles.pageSubtitle}>Schedule and manage blood donation drives seamlessly.</p>
      </div>

      <div className={styles.adminLayout}>

        {/* --- Column 1: Create Form --- */}
        <aside className={styles.sidebarNav}>
          <h3 className={styles.sidebarTitle}>
            <div className={styles.titleIcon}><PlusCircle size={18} /></div>
            Schedule New Camp
          </h3>
          <form onSubmit={handleCreate} className={styles.sidebarForm}>
            <div className={styles.formGroup}>
              <label>Camp Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Annual Drive" required />
            </div>
            
            <div className={styles.formGroup}>
              <label>Venue Name</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Main Hall" required />
            </div>
            <div className={styles.formGroup}>
              <label>Date & Time</label>
              <input type="datetime-local" value={campDate} onChange={e => setCampDate(e.target.value)} required />
            </div>

            <div className={styles.formGroup}>
              <label>Full Address</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows="2" placeholder="Street, City..." />
            </div>

            <div className={styles.formGroup}>
              <label>Google Maps Link (Optional)</label>
              <input type="url" value={gmapsLink} onChange={e => setGmapsLink(e.target.value)} placeholder="https://maps.app.goo.gl/..." />
            </div>

            <button type="submit" className={styles.submitBtn}>Create Camp Schedule</button>
          </form>
        </aside>

        {/* --- Column 2: Camp List --- */}
        <main className={styles.mainContent}>
          <div className={styles.listContainer}>
            <div className={styles.listHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h3 className={styles.containerTitle} style={{ margin: 0, padding: 0, border: 'none' }}>Upcoming Camps</h3>
                <span className={styles.countBadge}>{totalItems} Total</span>
              </div>
              
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                <input 
                  type="text" 
                  placeholder="Search camps..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '8px 8px 8px 35px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }} 
                />
              </form>
            </div>
            
            {isLoading ? <p className={styles.loadingText}>Loading schedules...</p> : (
              <div className={styles.campList}>
                {camps.length === 0 ? (
                  <div className={styles.emptyList}>No camps found.</div>
                ) : (
                  camps.map((camp) => (
                    <div key={camp.id} className={styles.campListItem}>
                      <div className={styles.campInfo}>
                        <h4 className={styles.campTitle}>{camp.title}</h4>
                        <div className={styles.campMeta}>
                          <span><Calendar size={14}/> {new Date(camp.camp_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'})}</span>
                          <span><Clock size={14}/> {new Date(camp.camp_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span><MapPin size={14}/> {camp.location}</span>
                        </div>
                        <p className={styles.campAddress}>{camp.address}</p>
                      </div>
                      
                      <div className={styles.campActions}>
                        <button onClick={() => navigate(`/admin/camps/${camp.id}`)} className={styles.actionBtnEdit} style={{ color: '#059669', backgroundColor: '#ecfdf5' }} title="View Details">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => startEdit(camp)} className={styles.actionBtnEdit} title="Edit Camp">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(camp.id)} className={styles.actionBtnDelete} title="Delete Camp">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderTop: '1px solid #e0e0e0', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>Items per page:</span>
                  <select 
                    value={limit} 
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', background: page === 1 ? '#f5f5f5' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>
                    Page <strong style={{color:'#111'}}>{page}</strong> of <strong style={{color:'#111'}}>{totalPages}</strong>
                  </span>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                    style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', background: page === totalPages ? '#f5f5f5' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- Edit Modal --- */}
      {editingCamp && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Camp Details</h3>
              <button className={styles.closeBtn} onClick={() => setEditingCamp(null)}><X size={24} /></button>
            </div>

            <form onSubmit={handleUpdate} className={styles.editFormGrid} style={{ display: 'block' }}>
              <div className={styles.editInputs} style={{ gridColumn: 'span 2' }}>
                <div className={styles.formGroup}>
                  <label>Title</label>
                  <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Date & Time</label>
                    <input type="datetime-local" value={editForm.camp_date} onChange={e => setEditForm({ ...editForm, camp_date: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Venue Name</label>
                    <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Full Address</label>
                  <textarea value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} rows="2" />
                </div>
                <div className={styles.formGroup}>
                  <label>Google Maps Link (Optional)</label>
                  <input type="url" value={editForm.google_maps_link || ''} onChange={e => setEditForm({ ...editForm, google_maps_link: e.target.value })} placeholder="https://maps.app.goo.gl/..." />
                </div>
              </div>

              <div className={styles.modalActions} style={{ marginTop: '2rem' }}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditingCamp(null)}>Cancel</button>
                <button type="submit" className={styles.saveBtn}><Save size={18} /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CampManagement;
