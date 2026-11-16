import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Mail, AlertTriangle, Save } from 'lucide-react';
import { getSystemSettings, updateSystemSetting } from '../../services/adminService';
import styles from './Settings.module.css';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSystemSettings();
      // Convert array of settings to key-value object
      const settingsObj = {};
      data.settings.forEach(s => {
        settingsObj[s.key] = s;
      });
      
      // Default mailing_enabled to true if not found in db
      if (!settingsObj['mailing_enabled']) {
        settingsObj['mailing_enabled'] = { key: 'mailing_enabled', value: 'true', type: 'boolean' };
      }
      
      setSettings(settingsObj);
    } catch (err) {
      setError('Failed to load system settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = async (key, currentValue) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess('');
      
      // Toggle value (assumes string 'true' / 'false')
      const newValue = currentValue === 'true' ? 'false' : 'true';
      
      await updateSystemSetting(key, newValue, 'boolean');
      
      setSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value: newValue }
      }));
      
      setSuccess('Settings updated successfully!');
      
      // Auto hide success
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update setting');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading system settings...</div>;

  const isMailingEnabled = settings['mailing_enabled']?.value === 'true';

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon}>
          <SettingsIcon size={28} />
        </div>
        <div className={styles.headerText}>
          <h1>System Settings</h1>
          <p>Configure global application behavior and features.</p>
        </div>
      </div>

      {error && (
        <div className={styles.alertError}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className={styles.alertSuccess}>
          <Save size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className={styles.settingsGrid}>
        
        {/* Mailing Card */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div className={isMailingEnabled ? styles.cardIconActive : styles.cardIconStopped}>
              <Mail size={24} />
            </div>
            <div className={styles.cardTitle}>
              <h2>Global Email System</h2>
              <p>Enable or disable all outgoing emails across the application.</p>
            </div>
          </div>
          
          <div className={styles.cardBody}>
            <div>
              <p className={styles.statusText}>
                Status: {isMailingEnabled ? (
                  <span className={styles.statusActive}>Active</span>
                ) : (
                  <span className={styles.statusStopped}>Stopped</span>
                )}
              </p>
              <p className={styles.statusDesc}>
                When stopped, all email dispatches (requests, reports, notifications) will be intercepted and logged as <span className={styles.codeBadge}>stopped</span> in the database.
              </p>
            </div>
            
            {/* Toggle Switch */}
            <button
              onClick={() => handleToggle('mailing_enabled', settings['mailing_enabled']?.value)}
              disabled={saving}
              className={`${styles.toggleBtn} ${isMailingEnabled ? styles.toggleActive : styles.toggleInactive} ${saving ? styles.toggleDisabled : ''}`}
              role="switch"
              aria-checked={isMailingEnabled}
            >
              <span 
                className={`${styles.toggleKnob} ${isMailingEnabled ? styles.knobActive : ''}`}
              />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
