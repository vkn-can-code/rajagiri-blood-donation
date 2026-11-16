import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/adminService';
import api from '../../services/api'; // Using raw api for new endpoints if service fn not added yet
import styles from './DepartmentManagement.module.css';
import CustomSelect from '../../components/common/CustomSelect';
import { showSuccess, showError, showConfirm } from '../../utils/swalUtils';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [deptName, setDeptName] = useState('');
    const [headFaculty, setHeadFaculty] = useState('');
    const [message, setMessage] = useState('');

    // Fetch Data
    const loadData = async () => {
        try {
            setLoading(true);
            const [deptRes, usersRes] = await Promise.all([
                api.get('/admin/departments'),
                getAllUsers()
            ]);

            setDepartments(deptRes.data);
            // Filter only faculty_admin for selection as Department Incharge
            setFacultyList(usersRes.filter(u => u.role === 'faculty_admin'));
        } catch (err) {
            console.error("Failed to load departments/faculty", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/departments', {
                name: deptName,
                head_faculty_id: headFaculty || null
            });
            showSuccess('Department Created', 'Department created successfully!');
            setDeptName('');
            setHeadFaculty('');
            loadData(); // Refresh list
        } catch (err) {
            console.error(err);
            showError('Submission Failed', 'Failed to create department.');
        }
    };

    const handleAssignHead = async (deptId, newFacultyId) => {
        try {
            await api.put(`/admin/departments/${deptId}/assign-faculty`, {
                facultyId: newFacultyId
            });
            loadData();
        } catch (err) {
            showError("Update Failed", "Failed to update department head.");
        }
    };

    return (
        <div className={styles.container}>
            <h2>Department Management</h2>

            {/* Create Department Form */}
            <div className={styles.card}>
                <h3>Create New Department</h3>
                <form onSubmit={handleCreate} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Department Name</label>
                        <input
                            type="text"
                            value={deptName}
                            onChange={e => setDeptName(e.target.value)}
                            placeholder="e.g. Computer Science"
                            required
                        />
                    </div>



                    <div className={styles.formGroup}>
                        <label>Department Incharge (Faculty)</label>
                        <CustomSelect
                            value={headFaculty}
                            onChange={(val) => setHeadFaculty(val)}
                            options={facultyList.map(f => ({ label: `${f.name} (${f.email})`, value: f.id }))}
                            placeholder="-- Select Faculty --"
                        />
                    </div>

                    <button type="submit" className={styles.btn}>Create Department</button>
                </form>
                {message && <p className={styles.msg}>{message}</p>}
            </div>

            {/* List Departments */}
            <div className={styles.list}>
                <h3>Current Departments</h3>
                {loading ? <p>Loading...</p> : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Department Incharge</th>
                                <th>Total Batches</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map(dept => (
                                <tr key={dept.id}>
                                    <td>{dept.id}</td>
                                    <td>{dept.name}</td>
                                    <td>
                                        {dept.HeadFaculty ? dept.HeadFaculty.name : <span style={{ color: 'red' }}>Unassigned</span>}
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                        {dept.Batches ? dept.Batches.length : 0}
                                    </td>
                                    <td>
                                        <div style={{ width: '200px' }}>
                                            <CustomSelect
                                                value=""
                                                onChange={async (val) => {
                                                    const selectedFaculty = facultyList.find(f => f.id === val);
                                                    const confirmed = await showConfirm("Reassign Head?", `Assign ${selectedFaculty?.name} as Head of ${dept.name}?`);
                                                    if (confirmed) {
                                                        handleAssignHead(dept.id, val);
                                                    }
                                                }}
                                                options={facultyList.map(f => ({ label: f.name, value: f.id }))}
                                                placeholder="Change Head..."
                                            />
                                        </div>
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

export default DepartmentManagement;
