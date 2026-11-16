// This file is src/pages/public/RequestResponse.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllOpenRequests, submitResponse } from '../../services/publicService';
import styles from './RequestResponse.module.css';
import Spinner from '../common/Spinner';
import Swal from 'sweetalert2';
import { Droplet, User, MapPin, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const RequestResponse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Form State
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Checklist State
  const [checks, setChecks] = useState({
    age: false,
    weight: false,
    health: false,
    // surgery - Removed (Merged into dental or removed)
    // tattoo - Removed
    dental: false,    // New
    thyroid: false,   // New
    antibiotics: false, // New
    periods: false,   // New
    substances: false // New (Alk/Smoke/Drugs)
  });

  const allChecksPassed = Object.values(checks).every(Boolean);

  // Fetch request details on mount
  useEffect(() => {
    const loadRequest = async () => {
      try {
        // Since we don't have a single get-by-id endpoint publicly exposed yet, 
        // we fetch all open and find the one we need. 
        // (In production, a specific endpoint /api/requests/:id is better)
        const allRequests = await getAllOpenRequests();
        const found = allRequests.find(r => r.id.toString() === id);

        if (found) {
          setRequest(found);
        } else {
          setError("Request not found or has been closed.");
        }
      } catch (err) {
        setError("Failed to load request details.");
      } finally {
        setIsPageLoading(false);
      }
    };
    loadRequest();
  }, [id]);

  const handleCheck = (field) => {
    setChecks(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allChecksPassed) return;

    setIsSubmitting(true);
    setError('');

    try {
      await submitResponse(id, message);
      await Swal.fire({
        title: 'Thank You!',
        text: 'Your response has been recorded. A volunteer will contact you.',
        icon: 'success',
        confirmButtonColor: 'var(--primary)'
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Failed to submit response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) return <div style={{ marginTop: '4rem' }}><Spinner /></div>;

  if (!request && !isPageLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorMessage}>
          <AlertCircle size={20} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
          Request not found or expired.
        </div>
      </div>
    );
  }

  // --- Compatibility Check ---
  let isCompatible = true;
  let compatibilityMessage = '';

  if (request && user) {
    if (!user.blood_group) {
      isCompatible = false;
      compatibilityMessage = 'Please update your blood group in your profile before volunteering.';
    } else {
      const donorBg = user.blood_group;
      const patientBg = request.required_blood_group;
      const compatibility = {
        'A+': ['A+', 'AB+'],
        'A-': ['A-', 'A+', 'AB-', 'AB+'],
        'B+': ['B+', 'AB+'],
        'B-': ['B-', 'B+', 'AB-', 'AB+'],
        'AB+': ['AB+'],
        'AB-': ['AB-', 'AB+'],
        'O+': ['O+', 'A+', 'B+', 'AB+'],
        'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
      };
      
      if (!compatibility[donorBg] || !compatibility[donorBg].includes(patientBg)) {
        isCompatible = false;
        compatibilityMessage = `Your blood group (${donorBg}) is not compatible with the requested blood group (${patientBg}).`;
      }
    }
  }

  return (
    <div className={styles.pageContainer}>

      {/* --- Left: Request Details Card --- */}
      <div className={styles.detailsCard}>
        <div className={styles.headerBg}>
          <div className={styles.bloodGroupLarge}>{request.required_blood_group}</div>
          <div className={styles.reqTitle}>Urgent Requirement</div>
        </div>

        <div className={styles.infoBody}>
          <div className={styles.infoRow}>
            <User className={styles.icon} size={20} color="#64748b" />
            <div>
              <div className={styles.infoLabel}>Patient</div>
              <strong>{request.patient_name}</strong>
            </div>
          </div>

          <div className={styles.infoRow}>
            <Droplet className={styles.icon} size={20} color="#64748b" />
            <div>
              <div className={styles.infoLabel}>Units</div>
              <strong>{request.units_required} Units Needed</strong>
            </div>
          </div>

          <div className={styles.infoRow}>
            <MapPin className={styles.icon} size={20} color="#64748b" />
            <div>
              <div className={styles.infoLabel}>Hospital</div>
              <strong>{request.hospital_name}</strong>
            </div>
          </div>

          {/* Map Link */}
          {request.google_maps_link && (
            <div className={styles.mapPreview} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
              <a 
                href={request.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <MapPin size={20} color="var(--primary)" />
                Open in Google Maps <ExternalLink size={16} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* --- Right: Action Form --- */}
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          <CheckCircle size={28} color="var(--primary)" /> I Can Help
        </h2>
        <p className={styles.formSubtitle}>
          Thank you for stepping up. Please confirm your eligibility before volunteering.
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}
        
        {!isCompatible && (
          <div className={styles.errorMessage} style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
            <AlertCircle size={20} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            {compatibilityMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Eligibility Checklist */}
          <div className={styles.checklist}>
            <div className={styles.checklistTitle}>Eligibility Check</div>

            <label className={styles.checkItem}>
              <input type="checkbox" checked={checks.age} onChange={() => handleCheck('age')} />
              <span className={styles.checkText}>I am between 18 and 65 years old.</span>
            </label>

            <label className={styles.checkItem}>
              <input type="checkbox" checked={checks.weight} onChange={() => handleCheck('weight')} />
              <span className={styles.checkText}>I weigh at least 45 kg (100 lbs).</span>
            </label>

            <label className={styles.checkItem}>
              <input type="checkbox" checked={checks.health} onChange={() => handleCheck('health')} />
              <span className={styles.checkText}>I am in good health and have no cold/flu/fever.</span>
            </label>

            <label className={styles.checkItem}>
              <input type="checkbox" checked={checks.dental} onChange={() => handleCheck('dental')} />
              <span className={styles.checkText}>No recent dental surgery, root canal, or dengue history.</span>
            </label>

            <label className={styles.checkItem}>
              <input type="checkbox" checked={checks.thyroid} onChange={() => handleCheck('thyroid')} />
              <span className={styles.checkText}>No Thyroid or other significant health issues.</span>
            </label>

            <label className={styles.checkItem}>
              <input type="checkbox" checked={checks.antibiotics} onChange={() => handleCheck('antibiotics')} />
              <span className={styles.checkText}>Have NOT taken Antibiotics in the last 2 weeks.</span>
            </label>

            <label className={styles.checkItem}>
              <input type="checkbox" checked={checks.periods} onChange={() => handleCheck('periods')} />
              <span className={styles.checkText}>Not prohibited due to menstruation (as per local guidelines).</span>
            </label>

            <label className={styles.checkItem}>
              <input type="checkbox" checked={checks.substances} onChange={() => handleCheck('substances')} />
              <span className={styles.checkText}>No smoking, drinking, or recreational drugs in last 48 hrs.</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Message (Optional)</label>
            <textarea
              rows="3"
              className={styles.textarea}
              placeholder="E.g., I can reach the hospital in 30 mins..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!allChecksPassed || isSubmitting || !isCompatible}
            style={!isCompatible ? { backgroundColor: '#cbd5e1', cursor: 'not-allowed' } : {}}
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Donation'}
          </button>

          {!allChecksPassed && (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>
              * You must check all eligibility boxes to proceed.
            </p>
          )}
        </form>
      </div>

    </div>
  );
};

export default RequestResponse;
