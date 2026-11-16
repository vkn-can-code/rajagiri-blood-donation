// This file is src/pages/public/PublicCamps.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllCamps } from '../../services/publicService';
import styles from './PublicCamps.module.css'; 
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import { Copy, MapPin, Map as MapIcon, Search, CalendarDays, ExternalLink, ClipboardEdit } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import RegistrationModal from '../../components/camps/RegistrationModal';

const PublicCamps = () => {
  const [allCamps, setAllCamps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('upcoming'); 
  const [selectedCamp, setSelectedCamp] = useState(null);

  const { user } = useAuth();

  const fetchCamps = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllCamps();
      setAllCamps(data); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  // Separate camps
  const { upcomingCamps, pastCamps } = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];
    
    const sortedCamps = [...allCamps].sort((a, b) => new Date(b.camp_date) - new Date(a.camp_date));
    
    sortedCamps.forEach(camp => {
      if (new Date(camp.camp_date) < now) {
        past.push(camp);
      } else {
        upcoming.push(camp);
      }
    });
    
    return { upcomingCamps: upcoming.reverse(), pastCamps: past };
  }, [allCamps]);

  // Filter
  const filteredList = useMemo(() => {
    const listToFilter = view === 'upcoming' ? upcomingCamps : pastCamps;
    const term = searchTerm.toLowerCase();
    if (!term) return listToFilter;
    
    return listToFilter.filter(camp =>
      camp.title.toLowerCase().includes(term) ||
      camp.location.toLowerCase().includes(term) ||
      (camp.address && camp.address.toLowerCase().includes(term))
    );
  }, [upcomingCamps, pastCamps, view, searchTerm]);

  const getGoogleMapsUrl = (camp) => {
    if (camp.google_maps_link) {
      return camp.google_maps_link;
    }
    if (camp.latitude && camp.longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${camp.latitude},${camp.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(camp.location)}`;
  };

  const handleCopyLink = (e, camp) => {
    e.stopPropagation();
    e.preventDefault();
    const url = getGoogleMapsUrl(camp);
    navigator.clipboard.writeText(url)
      .then(() => alert("Google Maps link copied to clipboard!"))
      .catch(() => alert("Failed to copy link."));
  };
  
  return (
    <div className={styles.pageContainer}>
      
      {/* --- PREMIUM HERO SECTION --- */}
      <div className={styles.heroSection}>
        <div className={styles.heroGlass}>
          <div className={styles.heroIconWrapper}>
            <CalendarDays className={styles.heroIcon} size={40} />
          </div>
          <h1 className={styles.heroTitle}>Donation Camps</h1>
          <p className={styles.heroSubtitle}>
            Find upcoming donation camps near you, or browse our history of past life-saving events.
          </p>
          
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by title, location, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className={styles.messageError}>{error}</div>}

      {/* --- CONTENT SECTION --- */}
      <div className={styles.contentSection}>
        
        {/* Segmented Toggle */}
        <div className={styles.toggleWrapper}>
          <div className={styles.segmentedControl}>
            <button 
              className={`${styles.segmentBtn} ${view === 'upcoming' ? styles.segmentBtnActive : ''}`}
              onClick={() => setView('upcoming')}
            >
              Upcoming ({upcomingCamps.length})
            </button>
            <button 
              className={`${styles.segmentBtn} ${view === 'past' ? styles.segmentBtnActive : ''}`}
              onClick={() => setView('past')}
            >
              Past Camps ({pastCamps.length})
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <Spinner />
        ) : filteredList.length === 0 ? (
          <div className={styles.emptyState}>
            <MapIcon size={64} color="#e2e8f0" strokeWidth={1} />
            <h3>No {view} camps found</h3>
            <p>There are no scheduled camps matching your criteria.</p>
          </div>
        ) : (
          <div className={styles.gridSection}>
            {filteredList.map((camp) => (
              <div key={camp.id} className={styles.campCard}>
                
                <div className={styles.cardHeader}>
                  <div className={styles.campDateBadge}>
                    <span className={styles.campDateMonth}>
                      {new Date(camp.camp_date).toLocaleString('en-IN', { month: 'short' })}
                    </span>
                    <span className={styles.campDateDay}>
                      {new Date(camp.camp_date).getDate()}
                    </span>
                  </div>
                  <div className={styles.headerInfo}>
                    <h3 className={styles.campTitle}>{camp.title}</h3>
                    <p className={styles.campTime}>
                      {new Date(camp.camp_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.locationWrapper}>
                    <MapPin size={18} className={styles.locationIcon} />
                    <div>
                      <span className={styles.locationTitle}>{camp.location}</span>
                      <span className={styles.locationAddress}>{camp.address || 'No address provided'}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a 
                      href={getGoogleMapsUrl(camp)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.mapLink}
                    >
                      <MapIcon size={16} /> Open in Maps <ExternalLink size={14} className={styles.externalIcon} />
                    </a>
                    <button 
                      className={styles.copyButton}
                      onClick={(e) => handleCopyLink(e, camp)}
                      title="Copy Maps Link"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  {view === 'upcoming' && user && (
                    <Button 
                      onClick={() => setSelectedCamp(camp)} 
                      style={{ fontSize: '0.85rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ClipboardEdit size={16} />
                      Register
                    </Button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCamp && (
        <RegistrationModal 
          camp={selectedCamp} 
          onClose={() => setSelectedCamp(null)} 
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default PublicCamps;
