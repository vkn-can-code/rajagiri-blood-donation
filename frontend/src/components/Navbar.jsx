// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Navbar.module.css';
import {
  Menu, X, Search, Phone, MapPin, Clock,
  Facebook, Twitter, Instagram, Droplet
} from 'lucide-react';

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth(); // Removed unused 'logout' if not needed here

  // "Sticky" logic: Check if scroll passes viewport height (hero height approx)
  useEffect(() => {
    const handleScroll = () => {
      // If we scroll past 80% of the viewport, snap the nav to top
      const heroHeight = window.innerHeight * 0.8;
      if (window.scrollY > heroHeight) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';

  // Navigation Links Data
  const navLinks = [
    { name: 'Requests', path: '/requests' },
    { name: 'Camps', path: '/camps' },

    { name: 'Contact', path: '/contact' },
  ];

  if (isAuthenticated) {
    navLinks.push({ name: 'Dashboard', path: '/dashboard' });
  } else {
    navLinks.push({ name: 'Login', path: '/login', style: { color: 'var(--primary)' } });
  }

  return (
    <>
      {/* 1. TOP INFO BAR (Only visible on Home top) */}
      {isHome && (
        <div className={styles.topBar} style={{ opacity: isSticky ? 0 : 1, transition: 'opacity 0.3s' }}>

          <div className={styles.brandLogo}>
            <div className={styles.acronymWrapper}>
              {/* R -> Rajagiri (Green) */}
              <div className={`${styles.letterGroup} ${styles.greenTheme}`}>
                <span className={styles.initial}>R</span>
                <span className={styles.fullText}>ajagiri</span>
              </div>

              <div className={styles.spacer}></div>

              {/* L -> Leading (Black) */}
              <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
                <span className={styles.initial}>L</span>
                <span className={styles.fullText}>eading</span>
              </div>

              {/* Y -> Youth (Black) */}
              <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
                <span className={styles.initial}>Y</span>
                <span className={styles.fullText}>outh</span>
              </div>

              {/* F -> For (Black) */}
              <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
                <span className={styles.initial}>F</span>
                <span className={styles.fullText}>or</span>
              </div>

              {/* E -> Empowerment (Black) */}
              <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
                <span className={styles.initial}>E</span>
                <span className={styles.fullText}>mpowerment</span>
              </div>
            </div>
          </div>

          <div className={styles.topBarContent}>
            <div className={styles.infoItem}>
              <Phone className={styles.infoIcon} size={18} />
              <div className={styles.infoText}>
                <h6>Emergency 24/7</h6>
                <p>+91 987 654 3210</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <MapPin className={styles.infoIcon} size={18} />
              <div className={styles.infoText}>
                <h6>Location</h6>
                <p>Rajagiri Campus</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Clock className={styles.infoIcon} size={18} />
              <div className={styles.infoText}>
                <h6>Working Hours</h6>
                <p>09:00 - 21:00</p>
              </div>
            </div>
          </div>

          <div className={styles.socialIcons}>
            <a href="#"><Facebook size={18} /></a>
            <a href="#"><Twitter size={18} /></a>
            <a href="#"><Instagram size={18} /></a>
          </div>
        </div>
      )}

      {/* 2. MAIN NAV BAR (Sticky) */}
      <nav
        className={`${styles.navWrapper} ${isSticky || !isHome ? styles.navSticky : styles.navBottom}`}
      >
        <div className={styles.navContainer}>

          {/* Logo in Nav (Visible when sticky or not home) - Optional if you want logo inside nav too */}
          {(isSticky || !isHome) && (
            <div className={styles.brandLogo} style={{ transform: 'scale(0.8)', flexDirection: 'row', gap: '10px' }}>
              <div className={styles.acronymWrapper} style={{ transform: 'scale(0.9)', transformOrigin: 'left center' }}>
                {/* R -> Rajagiri (Green) */}
                <div className={`${styles.letterGroup} ${styles.greenTheme}`}>
                  <span className={styles.initial}>R</span>
                  <span className={styles.fullText}>ajagiri</span>
                </div>
                <div className={styles.spacer}></div>
                {/* L -> Leading (Black) */}
                <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
                  <span className={styles.initial}>L</span>
                  <span className={styles.fullText}>eading</span>
                </div>
                {/* Y -> Youth (Black) */}
                <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
                  <span className={styles.initial}>Y</span>
                  <span className={styles.fullText}>outh</span>
                </div>
                {/* F -> For (Black) */}
                <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
                  <span className={styles.initial}>F</span>
                  <span className={styles.fullText}>or</span>
                </div>
                {/* E -> Empowerment (Black) */}
                <div className={`${styles.letterGroup} ${styles.blackTheme}`}>
                  <span className={styles.initial}>E</span>
                  <span className={styles.fullText}>mpowerment</span>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Links */}
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  style={link.style}
                  className={({ isActive }) => isActive ? styles.active : ''}
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Search & Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className={styles.searchBtn}>
              <Search size={20} />
            </button>

            <button
              className={styles.mobileToggle}
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* 3. MOBILE MENU OVERLAY */}
      <div className={`${styles.mobileOverlay} ${isMobileOpen ? styles.open : ''}`}>
        <div className={styles.mobileBackdrop} onClick={() => setIsMobileOpen(false)} />

        <div className={styles.mobileMenu}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ color: 'white', margin: 0 }}>Menu</h3>
            <button
              onClick={() => setIsMobileOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={28} />
            </button>
          </div>

          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => isActive ? styles.active : ''}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
