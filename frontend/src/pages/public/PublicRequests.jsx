import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllOpenRequests } from '../../services/publicService';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import styles from './PublicRequests.module.css';
import Spinner from '../common/Spinner';
import { 
  Droplet, 
  MapPin, 
  Calendar, 
  User, 
  Search, 
  Map as MapIcon,
  ExternalLink,
  Activity,
  Heart
} from 'lucide-react';

const PublicRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { isAuthenticated } = useAuth();

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllOpenRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter Logic
  const filteredRequests = useMemo(() => {
    if (!searchTerm) return requests;
    const lowerTerm = searchTerm.toLowerCase();
    return requests.filter(req => 
      req.hospital_name.toLowerCase().includes(lowerTerm) ||
      req.patient_name.toLowerCase().includes(lowerTerm) ||
      req.required_blood_group.toLowerCase().includes(lowerTerm)
    );
  }, [requests, searchTerm]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short'
    });
  };

  const getGoogleMapsUrl = (req) => {
    if (req.google_maps_link) {
        return req.google_maps_link;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.hospital_name)}`;
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* --- HERO SECTION --- */}
      <div className={styles.heroSection}>
        <div className={styles.heroGlass}>
          <div className={styles.heroIconWrapper}>
            <Heart className={styles.heroIcon} size={40} />
          </div>
          <h1 className={styles.heroTitle}>Urgent Blood Requests</h1>
          <p className={styles.heroSubtitle}>
            Local hospitals urgently need your help. View real-time requests below.
          </p>
          
          <div className={styles.statsBar}>
            <div className={styles.statBadge}>
              <Activity size={16} /> <span>{requests.length} Active Needs</span>
            </div>
            <div className={styles.statBadge} style={{ color: 'var(--primary)', background: 'var(--primary-light)' }}>
              <Droplet size={16} /> <span>1 Unit = 1 Life Saved</span>
            </div>
          </div>

          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder="Search by hospital, blood group, or patient name..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className={styles.messageError}>{error}</div>}

      {/* --- CONTENT SECTION --- */}
      {isLoading ? <Spinner /> : (
        <div className={styles.contentSection}>
          <div className={styles.gridSection}>
              {filteredRequests.length === 0 ? (
                <div className={styles.emptyState}>
                  <Droplet size={64} color="#e2e8f0" strokeWidth={1} />
                  <h3>No requests found</h3>
                  <p>There are no active requests matching your search.</p>
                </div>
              ) : (
                filteredRequests.map(req => (
                  <div key={req.id} className={styles.requestCard}>
                    
                    <div className={styles.cardHeader}>
                      <div className={styles.hospitalInfo}>
                        <h3 className={styles.hospitalName}>{req.hospital_name}</h3>
                        <div className={styles.patientInfo}>
                          <User size={14} className={styles.subIcon} /> {req.patient_name}
                        </div>
                      </div>
                      <div className={styles.bloodBadge}>
                        {req.required_blood_group}
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <Droplet size={16} className={styles.detailIcon}/>
                          <div>
                            <span className={styles.detailLabel}>Units Needed</span>
                            <span className={styles.detailValue}>{req.units_required}</span>
                          </div>
                        </div>
                        <div className={styles.detailItem}>
                          <Calendar size={16} className={styles.detailIcon}/>
                          <div>
                            <span className={styles.detailLabel}>Posted On</span>
                            <span className={styles.detailValue}>{formatDate(req.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <a 
                        href={getGoogleMapsUrl(req)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.mapLink}
                        onClick={(e) => e.stopPropagation()} 
                      >
                        <MapIcon size={16} /> View on Google Maps <ExternalLink size={14} className={styles.externalIcon} />
                      </a>
                    </div>

                    <div className={styles.cardFooter}>
                        {isAuthenticated ? (
                          <Link to={`/requests/${req.id}/respond`} className={styles.respondBtn}>
                            Respond to Request
                          </Link>
                        ) : (
                          <Link to="/login" className={styles.loginBtn}>
                            Login to Help
                          </Link>
                        )}
                    </div>

                  </div>
                ))
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicRequests;
