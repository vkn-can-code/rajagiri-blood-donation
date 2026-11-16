import React, { useState, useEffect } from 'react';
import { getAllRequestsAdmin, grantCertificate } from '../../services/adminService';
import { Eye, Award, CheckCircle, Smartphone, User, FileText } from 'lucide-react';
import styles from './RequestList.module.css';
import Swal from 'sweetalert2';

const RequestList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null); // ID of the request whose volunteers are shown

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);

    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const currentRequests = requests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getAllRequestsAdmin();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
            Swal.fire('Error', 'Failed to load requests.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGrantCertificate = async (responseId, studentName) => {
        const result = await Swal.fire({
            title: 'Grant Certificate?',
            text: `Are you sure you want to mark ${studentName} as completed and grant the certificate?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Grant',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await grantCertificate(responseId);
                Swal.fire('Success', 'Certificate granted successfully!', 'success');
                // Refresh Data
                fetchRequests();
            } catch (error) {
                Swal.fire('Error', error.message || 'Failed to grant certificate.', 'error');
            }
        }
    };

    const toggleRow = (requestId) => {
        if (expandedRow === requestId) {
            setExpandedRow(null);
        } else {
            setExpandedRow(requestId);
        }
    };

    if (loading) return <div className={styles.loading}>Loading requests...</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>Blood Requests & Volunteers</h2>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Hospital</th>
                            <th>Group</th>
                            <th>Units</th>
                            <th>Status</th>
                            <th>Volunteers</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRequests.map((req) => (
                            <React.Fragment key={req.id}>
                                <tr className={req.status === 'open' ? styles.rowOpen : styles.rowClosed}>
                                    <td>
                                        <div className={styles.patientInfo}>
                                            <strong>{req.patient_name}</strong>
                                            <span className={styles.date}>{new Date(req.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>{req.hospital_name}</td>
                                    <td><span className={styles.bloodGroup}>{req.required_blood_group}</span></td>
                                    <td>{req.units_required}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[req.status]}`}>
                                            {req.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        {req.RequestResponses?.length > 0 ? (
                                            <span className={styles.volunteerCount}>
                                                {req.RequestResponses.length} Volunteer(s)
                                            </span>
                                        ) : (
                                            <span className={styles.noVolunteers}>No volunteers</span>
                                        )}
                                    </td>
                                    <td>
                                        <button className={styles.actionBtn} onClick={() => toggleRow(req.id)}>
                                            {expandedRow === req.id ? 'Hide Details' : 'View Volunteers'}
                                        </button>
                                    </td>
                                </tr>

                                {/* Expanded Row for Volunteers */}
                                {expandedRow === req.id && (
                                    <tr>
                                        <td colSpan="7" className={styles.expandedCell}>
                                            <div className={styles.volunteersList}>
                                                <h4>Volunteers for {req.patient_name}</h4>
                                                {req.RequestResponses && req.RequestResponses.length > 0 ? (
                                                    <table className={styles.innerTable}>
                                                        <thead>
                                                            <tr>
                                                                <th>Student</th>
                                                                <th>Batch / Dept</th>
                                                                <th>Contact</th>
                                                                <th>Message</th>
                                                                <th>Status</th>
                                                                <th>Certificate & Verification</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {req.RequestResponses.map((res) => (
                                                                <tr key={res.id}>
                                                                    <td>{res.User?.name || 'Unknown'}</td>
                                                                    <td>
                                                                        {res.User?.StudentBatch?.batch_name || '-'} <br />
                                                                        <small>{res.User?.StudentBatch?.Department?.name || '-'}</small>
                                                                    </td>
                                                                    <td>
                                                                        <div className={styles.contactInfo}>
                                                                            <Smartphone size={14} /> {res.User?.phone_number} <br />
                                                                            {res.User?.email}
                                                                        </div>
                                                                    </td>
                                                                    <td className={styles.messageCell}>"{res.message || 'No message'}"</td>
                                                                    <td>
                                                                        <span style={{
                                                                            display: 'inline-block',
                                                                            padding: '4px 8px',
                                                                            borderRadius: '4px',
                                                                            fontSize: '0.8rem',
                                                                            fontWeight: 'bold',
                                                                            color: res.status === 'rejected' ? '#ef4444' : (res.status === 'accepted' ? 'var(--primary)' : '#3b82f6'),
                                                                            backgroundColor: res.status === 'rejected' ? '#fef2f2' : (res.status === 'accepted' ? '#ecfdf5' : '#eff6ff'),
                                                                        }}>
                                                                            {(res.status || 'unknown').toUpperCase()}
                                                                        </span>
                                                                        {res.reason && (
                                                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                                                                                {res.reason}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {/* Case 1: Granted - Show Badge */}
                                                                        {res.certificate_status === 'granted' && (
                                                                            <span className={styles.badgeDonated}>
                                                                                <Award size={14} /> Blood Donated
                                                                            </span>
                                                                        )}

                                                                        {/* Case 2: Uploaded but Pending Verification */}
                                                                        {res.certificate_url && res.certificate_status !== 'granted' && (
                                                                            <div className={styles.verificationGroup}>
                                                                                <a href={res.certificate_url} target="_blank" rel="noreferrer" className={styles.viewLink}>
                                                                                    <FileText size={14} /> View Cert
                                                                                </a>
                                                                                <button
                                                                                    className={styles.grantBtn}
                                                                                    onClick={() => handleGrantCertificate(res.id, res.User?.name)}
                                                                                >
                                                                                    <CheckCircle size={14} /> Verify & Grant
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        {/* Case 3: No Upload */}
                                                                        {!res.certificate_url && res.certificate_status !== 'granted' && (
                                                                            <span className={styles.statusPending}>
                                                                                Waiting for Certificate
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <p>No volunteers found for this request.</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                {requests.length === 0 && <div className={styles.emptyState}>No requests found.</div>}
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Items per page:</span>
                        <select 
                            value={itemsPerPage} 
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155' }}
                        >
                            <option value={8}>8</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                            style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: '#334155', fontWeight: '500' }}
                        >
                            Previous
                        </button>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                        </span>
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                            style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', background: currentPage === totalPages ? '#f8fafc' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: '#334155', fontWeight: '500' }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestList;
