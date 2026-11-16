// src/pages/common/Profile.jsx

import React from "react";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "./Spinner";
import styles from "./Profile.module.css";

const Profile = () => {
  const { user, login } = useAuth(); // login function might be needed to refresh user context? Better to reload or refetch. 
  // Actually useAuth might provide a way to update user, or we just reload.
  // For now, let's assume we can just fetch updated profile or manually update state if possible. 
  // But standard pattern is to refetch.

  const [loading, setLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({});

  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone_number: user.phone_number || "",
        blood_group: user.blood_group || "",
        height: user.height || "",
        weight: user.weight || "",
        gender: user.gender || "",
        address: user.address || "",
        student_id: user.student_id || "",
        password: "", // Password is blank by default
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Import API service dynamically or use fetch
      // Assuming a generic api helper exists, or using fetch with token
      const token = localStorage.getItem("token"); // Quick fix, ideally use an api client
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Ideally trigger a user reload here.
      // For now, simple alert or auto-reload
      setTimeout(() => window.location.reload(), 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Spinner />;

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {user.name?.charAt(0)?.toUpperCase()}
        </div>

        <div>
          {/* Badges Display */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
            {user.badges && user.badges.map((badge, idx) => (
              <span key={idx} style={{ background: '#FFD700', color: '#000', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                {badge}
              </span>
            ))}
            {user.has_donated && (
              <span style={{ background: '#C00000', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                🩸 Donor
              </span>
            )}
          </div>

          <h1 className={styles.profileName}>{user.name}</h1>
          <p className={styles.profileTagline}>{user.role}</p>
        </div>

        <button
          className={styles.editButton}
          onClick={() => setIsEditing(!isEditing)}
          style={{ marginLeft: 'auto', padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className={styles.profileCard}>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

        {!isEditing ? (
          <>
            <h2 className={styles.sectionTitle}>Personal Information</h2>
            <div className={styles.grid}>
              <div className={styles.infoBox}><label>Name</label><p>{user.name}</p></div>
              <div className={styles.infoBox}><label>Email</label><p>{user.email}</p></div>
              <div className={styles.infoBox}><label>Phone</label><p>{user.phone_number}</p></div>
              <div className={styles.infoBox}><label>Blood Group</label><p>{user.blood_group || "-"}</p></div>
              <div className={styles.infoBox}><label>Height</label><p>{user.height ? `${user.height} cm` : "-"}</p></div>
              <div className={styles.infoBox}><label>Weight</label><p>{user.weight ? `${user.weight} kg` : "-"}</p></div>
              <div className={styles.infoBox}><label>Gender</label><p>{user.gender || "-"}</p></div>
              <div className={styles.infoBox}><label>Student ID</label><p>{user.student_id || "-"}</p></div>
              <div className={styles.infoBox}><label>Address</label><p>{user.address || "-"}</p></div>
            </div>

            {user.role === "student" && user.StudentBatch && (
              <>
                <hr className={styles.divider} />
                <h2 className={styles.sectionTitle}>Academic Information</h2>
                <div className={styles.grid}>
                  <div className={styles.infoBox}><label>Batch</label><p>{user.StudentBatch.batch_name}</p></div>
                </div>
              </>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className={styles.editForm}>
            <h2 className={styles.sectionTitle}>Edit Profile</h2>

            <div className={styles.formGroup}>
              <label>Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className={styles.input} />
            </div>

            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input name="phone_number" value={formData.phone_number} onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>Blood Group</label>
                <select name="blood_group" value={formData.blood_group} onChange={handleChange} className={styles.input}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Height (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={styles.input}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Student ID</label>
                <input name="student_id" value={formData.student_id} onChange={handleChange} className={styles.input} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className={styles.input} rows="3" />
            </div>

            <div className={styles.formGroup} style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <label>Change Password (leave blank to keep current)</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className={styles.input} placeholder="New Password" />
            </div>

            <button type="submit" disabled={loading} className={styles.saveButton} style={{ marginTop: '20px', padding: '10px 20px', background: '#C00000', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
