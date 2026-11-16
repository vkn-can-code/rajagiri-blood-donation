import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../pages/common/Button';
import api from '../../services/api';
import { showSuccess, showError } from '../../utils/swalUtils';

const RegistrationModal = ({ camp, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    weight_over_45: null,
    already_donated: null,
    major_surgery: null,
    on_medication: null,
    tattoo_piercing: null,
    consumed_alcohol: null,
    dental_work: null,
    pregnant_breastfeeding: null,
    history_disease: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    { key: 'weight_over_45', label: "Is your weight over 45 kg?" },
    { key: 'already_donated', label: "Have you already donated blood before?" },
    { key: 'major_surgery', label: "Have you had any major surgery in the last six months?" },
    { key: 'on_medication', label: "Are you currently on any medication (today or regular)?" },
    { key: 'tattoo_piercing', label: "Have you had a tattoo or piercing in the last 12 months?" },
    { key: 'consumed_alcohol', label: "Have you consumed alcohol in the last 24 hours?" },
    { key: 'dental_work', label: "Have you had any dental work in the last 3 days?" },
    { key: 'pregnant_breastfeeding', label: "Are you pregnant, breastfeeding, or on your periods?" },
    { key: 'history_disease', label: "Do you have a history of Diabetes, BP, Heart disease, Epilepsy, Hepatitis, or HIV?" }
  ];

  const handleOptionChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all questions answered
    if (Object.values(formData).some(val => val === null)) {
      return showError('Incomplete', 'Please answer all eligibility questions.');
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/camps/${camp.id}/register`, formData);
      showSuccess('Submitted!', res.data.message);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showError('Registration Failed', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#d32f2f' }}>Register for {camp.title}</h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={24} /></button>
        </div>

        <div style={bodyStyle}>
          <p style={{ marginBottom: '1.5rem', color: '#555' }}>
            Please answer the following eligibility questions honestly. Your answers help ensure the safety of both the donor and the recipient.
          </p>

          <form onSubmit={handleSubmit}>
            {questions.map((q, i) => (
              <div key={q.key} style={questionRowStyle}>
                <p style={questionTextStyle}>
                  {i + 1}. {q.label}
                </p>
                <div style={radioGroupStyle}>
                  <label style={radioLabelStyle}>
                    <input 
                      type="radio" 
                      name={q.key} 
                      checked={formData[q.key] === true}
                      onChange={() => handleOptionChange(q.key, true)}
                    />
                    Yes
                  </label>
                  <label style={radioLabelStyle}>
                    <input 
                      type="radio" 
                      name={q.key} 
                      checked={formData[q.key] === false}
                      onChange={() => handleOptionChange(q.key, false)}
                    />
                    No
                  </label>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button type="button" onClick={onClose} style={{ background: '#ccc', color: '#333' }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '600px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
};

const headerStyle = {
  padding: '1.5rem',
  borderBottom: '1px solid #eee',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#666'
};

const bodyStyle = {
  padding: '1.5rem',
  overflowY: 'auto'
};

const questionRowStyle = {
  marginBottom: '1rem',
  padding: '1rem',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  border: '1px solid #eee'
};

const questionTextStyle = {
  margin: '0 0 0.5rem 0',
  fontWeight: '500',
  color: '#333'
};

const radioGroupStyle = {
  display: 'flex',
  gap: '1.5rem'
};

const radioLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer'
};

export default RegistrationModal;
