// src/pages/admin/CampDataEntry.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCampById,
  getCampDonations,
  getCampRegistrations,
  searchUsers,
  recordCampDonation,
} from '../../services/adminService';
import styles from './CampDataEntry.module.css';
import Spinner from '../common/Spinner';

// ── Helpers ──────────────────────────────────────────────────
const BLOOD_COLORS = {
  'A+': '#dc2626', 'A-': '#b91c1c',
  'B+': '#2563eb', 'B-': '#1d4ed8',
  'O+': '#059669', 'O-': '#047857',
  'AB+': '#7c3aed', 'AB-': '#6d28d9',
};

const bgColor = (bg) => BLOOD_COLORS[bg] || '#6b7280';

const avatarColor = (name = '') => {
  const colors = ['#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2'];
  return colors[name.charCodeAt(0) % colors.length];
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const todayISO = () => new Date().toISOString().split('T')[0];

const REG_STATUS_CLASS = {
  approved: styles.statusApproved,
  pending: styles.statusPending,
  rejected: styles.statusRejected,
  auto_rejected: styles.statusAutoRejected,
};

// ── Search Bar ───────────────────────────────────────────────
function DonorSearchBar({ onSelect, disabled }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const onOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);

    if (val.length < 2) { setResults([]); setOpen(false); return; }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchUsers(val);
        setResults(data);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 280);
  };

  const pick = (user) => {
    onSelect(user);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div className={styles.searchWrapper} ref={wrapRef}>
      <div className={styles.searchInputWrap}>
        {/* Search icon (inline SVG — no emoji) */}
        <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          id="donor-search-input"
          type="text"
          className={styles.searchInput}
          placeholder="Search by name, email or phone..."
          value={query}
          onChange={handleChange}
          autoComplete="off"
          disabled={disabled}
        />
        {loading && <span className={styles.searchLoader} />}
      </div>

      {open && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map((u) => (
            <div key={u.id} className={styles.dropdownItem} onClick={() => pick(u)}>
              <div
                className={styles.dropdownAvatar}
                style={{ background: avatarColor(u.name) }}
              >
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.dropdownContent}>
                <div className={styles.dropdownName}>{u.name}</div>
                <div className={styles.dropdownSub}>
                  {u.email}{u.phone_number ? ` · ${u.phone_number}` : ''}
                </div>
              </div>
              {u.blood_group && (
                <div
                  className={styles.dropdownBg}
                  style={{ background: bgColor(u.blood_group) }}
                >
                  {u.blood_group}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownNoResult}>No matching users found</div>
        </div>
      )}
    </div>
  );
}

// ── Donor Card ───────────────────────────────────────────────
function DonorCard({ donor, onClear }) {
  const bg = bgColor(donor.blood_group);
  const av = avatarColor(donor.name);
  return (
    <div className={styles.donorCard}>
      <div className={styles.donorAvatar} style={{ background: av }}>
        {donor.name.charAt(0).toUpperCase()}
      </div>
      <div className={styles.donorInfo}>
        <p className={styles.donorName}>{donor.name}</p>
        <p className={styles.donorDetail}>{donor.email}</p>
        {donor.phone_number && <p className={styles.donorDetail}>{donor.phone_number}</p>}
        <div className={styles.donorTags}>
          <span className={`${styles.donorTag} ${styles.donorTagRole}`}>
            {(donor.role || '').replace(/_/g, ' ')}
          </span>
          {donor.blood_group && (
            <span className={`${styles.donorTag} ${styles.donorTagBlood}`} style={{ background: bg }}>
              {donor.blood_group}
            </span>
          )}
          {donor.has_donated && (
            <span className={`${styles.donorTag} ${styles.donorTagDonor}`}>Previous donor</span>
          )}
        </div>
        {donor.last_donation_date && (
          <p className={styles.donorDetail} style={{ marginTop: 4 }}>
            Last donated: {fmtDate(donor.last_donation_date)}
          </p>
        )}
      </div>
      <button className={styles.donorClear} onClick={onClear} title="Remove">&#x2715;</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
const CampDataEntry = () => {
  const { id: campId } = useParams();

  const [camp, setCamp]                   = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [donations, setDonations]         = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  // Form
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donationDate, setDonationDate]   = useState(todayISO());
  const [bloodUnits, setBloodUnits]       = useState('1');
  const [notes, setNotes]                 = useState('');

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg]     = useState('');

  // Table tabs + filter
  const [activeTab, setActiveTab]       = useState('registrations'); // 'registrations' | 'donations'
  const [filterText, setFilterText]     = useState('');

  // ── Load data ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [campData, regsData, donsData] = await Promise.all([
        getCampById(campId),
        getCampRegistrations(campId),
        getCampDonations(campId),
      ]);
      setCamp(campData);
      setRegistrations(regsData);
      setDonations(donsData);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  }, [campId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Pre-fill donor from participant row ──────────────────
  const handleSelectFromTable = (reg) => {
    if (!reg.User) return;
    setSelectedDonor({
      id: reg.User.id,
      name: reg.User.name,
      email: reg.User.email,
      phone_number: reg.User.phone_number,
      blood_group: reg.User.blood_group,
      role: reg.User.role,
      has_donated: reg.User.has_donated,
      last_donation_date: reg.User.last_donation_date,
    });
    setErrorMsg('');
    setSuccessMsg('');
    // Scroll form into view on mobile
    document.getElementById('donor-search-input')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // ── Submit form ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!selectedDonor) { setErrorMsg('Select a donor first.'); return; }

    setIsSubmitting(true);
    try {
      const result = await recordCampDonation(campId, {
        user_id: selectedDonor.id,
        donation_date: donationDate,
        blood_units: bloodUnits ? Number(bloodUnits) : undefined,
        notes: notes.trim() || undefined,
      });

      // Optimistic update
      setDonations((prev) => [result.donation, ...prev]);
      setSuccessMsg(result.message);
      setSelectedDonor(null);
      setBloodUnits('1');
      setNotes('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record donation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Derived sets ─────────────────────────────────────────
  // Set of user IDs who already have a recorded donation at this camp
  const donatedUserIds = new Set(donations.map((d) => d.user_id || d.User?.id));

  // Filter helpers
  const matchText = (reg, text) => {
    const t = text.toLowerCase();
    return (
      reg.User?.name?.toLowerCase().includes(t) ||
      reg.User?.email?.toLowerCase().includes(t) ||
      reg.User?.phone_number?.includes(t)
    );
  };

  const filteredRegs = registrations.filter((r) =>
    !filterText || matchText(r, filterText)
  );

  const filteredDons = donations.filter((d) => {
    const t = filterText.toLowerCase();
    return (
      !filterText ||
      d.User?.name?.toLowerCase().includes(t) ||
      d.User?.email?.toLowerCase().includes(t) ||
      d.User?.phone_number?.includes(t)
    );
  });

  // Stats
  const totalReg       = registrations.length;
  const totalApproved  = registrations.filter((r) => r.status === 'approved').length;
  const totalDonated   = donations.length;

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.pageContainer}>

      {/* ── TOP BANNER ── */}
      <div className={styles.topBanner}>
        <Link to={`/admin/camps/${campId}`} className={styles.backLink}>
          &#8592; Back to Camp Details
        </Link>

        <div className={styles.bannerMeta}>
          <div className={styles.campTitleGroup}>
            <p className={styles.campName}>{camp?.title || 'Camp Data Entry'}</p>
            <p className={styles.campMeta}>
              {fmtDate(camp?.camp_date)} &nbsp;&middot;&nbsp; {camp?.location}
            </p>
          </div>

          <div className={styles.statPills}>
            <div className={`${styles.pill} ${styles.pillBlue}`}>
              <span>{totalReg}</span> Registered
            </div>
            <div className={`${styles.pill} ${styles.pillGreen}`}>
              <span>{totalDonated}</span> Donated
            </div>
            <div className={`${styles.pill} ${styles.pillRed}`}>
              <span>{totalApproved - totalDonated < 0 ? 0 : totalApproved - totalDonated}</span> Pending
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className={styles.body}>

        {/* ════════════════════════════
            LEFT — Entry Form
        ════════════════════════════ */}
        <div className={styles.formPanel}>
          <div className={styles.formPanelInner}>
            <p className={styles.panelTitle}>Record Donation</p>

            {/* Alerts */}
            {successMsg && (
              <div className={styles.alertSuccess}>
                {successMsg}
                <button className={styles.alertClose} onClick={() => setSuccessMsg('')}>&#x2715;</button>
              </div>
            )}
            {errorMsg && (
              <div className={styles.alertError}>
                {errorMsg}
                <button className={styles.alertClose} onClick={() => setErrorMsg('')}>&#x2715;</button>
              </div>
            )}

            {/* Search */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="donor-search-input">
                Donor <span className={styles.fieldRequired}>*</span>
              </label>
              <DonorSearchBar onSelect={setSelectedDonor} disabled={isSubmitting} />
              {selectedDonor
                ? <DonorCard donor={selectedDonor} onClear={() => setSelectedDonor(null)} />
                : (
                  <div className={styles.emptyDonorSlot}>
                    Search a registered user or click &ldquo;Select&rdquo; from the participant list
                  </div>
                )
              }
            </div>

            <hr className={styles.divider} />

            {/* Date + Blood Units — inline row */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className={styles.fieldGroup} style={{ flex: 1 }}>
                <label className={styles.fieldLabel} htmlFor="donation-date-input">
                  Donation Date <span className={styles.fieldRequired}>*</span>
                </label>
                <input
                  id="donation-date-input"
                  type="date"
                  className={styles.fieldInput}
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  max={todayISO()}
                  required
                />
              </div>

              <div className={styles.fieldGroup} style={{ width: '120px', flexShrink: 0 }}>
                <label className={styles.fieldLabel} htmlFor="blood-units-input">
                  Blood Units
                </label>
                <select
                  id="blood-units-input"
                  className={styles.fieldInput}
                  value={bloodUnits}
                  onChange={(e) => setBloodUnits(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6].map((u) => (
                    <option key={u} value={String(u)}>
                      {u} {u === 1 ? 'unit' : 'units'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="notes-input">
                Notes <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="notes-input"
                className={styles.fieldTextarea}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Remarks, observations..."
                rows={3}
              />
            </div>

            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedDonor}
            >
              {isSubmitting
                ? <><span className={styles.btnSpinner} /> Saving...</>
                : 'Save Donation Record'
              }
            </button>
          </div>
        </div>

        {/* ════════════════════════════
            RIGHT — Participants Table
        ════════════════════════════ */}
        <div className={styles.tablePanel}>

          {/* Table header */}
          <div className={styles.tablePanelHeader}>
            <p className={styles.tablePanelTitle}>
              {activeTab === 'registrations'
                ? `Registered Participants (${filteredRegs.length})`
                : `Recorded Donations (${filteredDons.length})`
              }
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Filter input */}
              <input
                type="text"
                className={styles.tableFilterInput}
                placeholder="Filter by name / email / phone..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />

              {/* Tab toggle */}
              <div className={styles.tabGroup}>
                <button
                  className={`${styles.tabBtn} ${activeTab === 'registrations' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('registrations')}
                >
                  Registrations ({registrations.length})
                </button>
                <button
                  className={`${styles.tabBtn} ${activeTab === 'donations' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('donations')}
                >
                  Donations ({donations.length})
                </button>
              </div>
            </div>
          </div>

          {/* Table body scroll area */}
          <div className={styles.tablePanelBody}>

            {/* ── REGISTRATIONS TAB ── */}
            {activeTab === 'registrations' && (
              filteredRegs.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>No registrations found</p>
                  <p className={styles.emptySub}>
                    {filterText ? 'Try a different search term.' : 'No one has registered for this camp yet.'}
                  </p>
                </div>
              ) : (
                <table className={styles.participantTable}>
                  <thead>
                    <tr>
                      <th className={styles.tdSeq}>#</th>
                      <th>Name</th>
                      <th>Blood Group</th>
                      <th>Registration</th>
                      <th>Donor Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegs.map((reg, idx) => {
                      const hasDonated = donatedUserIds.has(reg.user_id);
                      const isSelected = selectedDonor?.id === reg.user_id;
                      return (
                        <tr
                          key={reg.id}
                          className={hasDonated ? styles.trRecorded : ''}
                        >
                          <td className={styles.tdSeq}>{idx + 1}</td>
                          <td>
                            <div className={styles.personCell}>
                              <div
                                className={styles.personAvatar}
                                style={{ background: avatarColor(reg.User?.name || '') }}
                              >
                                {(reg.User?.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className={styles.personName}>{reg.User?.name || '—'}</p>
                                <p className={styles.personContact}>{reg.User?.email || '—'}</p>
                                {reg.User?.phone_number && (
                                  <p className={styles.personContact}>{reg.User.phone_number}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {reg.User?.blood_group
                              ? <span className={styles.bgBadge} style={{ background: bgColor(reg.User.blood_group) }}>{reg.User.blood_group}</span>
                              : <span className={styles.bgNone}>—</span>
                            }
                          </td>
                          <td>
                            <span className={`${styles.regStatusBadge} ${REG_STATUS_CLASS[reg.status] || ''}`}>
                              {(reg.status || '').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className={styles.donorStatusCell}>
                            {hasDonated
                              ? <span className={styles.donatedBadge}>Recorded</span>
                              : <span className={styles.notDonatedBadge}>Not yet</span>
                            }
                          </td>
                          <td>
                            {hasDonated ? (
                              <button className={styles.selectBtnDone} disabled>Done</button>
                            ) : (
                              <button
                                className={styles.selectBtn}
                                onClick={() => handleSelectFromTable(reg)}
                                style={isSelected ? { background: '#1e40af' } : {}}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}

            {/* ── DONATIONS TAB ── */}
            {activeTab === 'donations' && (
              filteredDons.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>No donations recorded yet</p>
                  <p className={styles.emptySub}>Use the form on the left to record the first donation.</p>
                </div>
              ) : (
                <table className={styles.participantTable}>
                  <thead>
                    <tr>
                      <th className={styles.tdSeq}>#</th>
                      <th>Donor</th>
                      <th>Blood Group</th>
                      <th>Role</th>
                      <th>Donation Date</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDons.map((don, idx) => (
                      <tr key={don.id}>
                        <td className={styles.tdSeq}>{idx + 1}</td>
                        <td>
                          <div className={styles.personCell}>
                            <div
                              className={styles.personAvatar}
                              style={{ background: avatarColor(don.User?.name || '') }}
                            >
                              {(don.User?.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className={styles.personName}>{don.User?.name || '—'}</p>
                              <p className={styles.personContact}>{don.User?.email || '—'}</p>
                              {don.User?.phone_number && (
                                <p className={styles.personContact}>{don.User.phone_number}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {don.User?.blood_group
                            ? <span className={styles.bgBadge} style={{ background: bgColor(don.User.blood_group) }}>{don.User.blood_group}</span>
                            : <span className={styles.bgNone}>—</span>
                          }
                        </td>
                        <td>
                          <span className={styles.regStatusBadge} style={{ background: '#f3f4f6', color: '#374151' }}>
                            {(don.User?.role || '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                          {fmtDate(don.donation_date)}
                        </td>
                        <td>
                          {don.certificate_url === 'camp_entry'
                            ? <span className={styles.regStatusBadge} style={{ background: '#ede9fe', color: '#6d28d9' }}>Camp Entry</span>
                            : <span className={styles.regStatusBadge} style={{ background: '#fef3c7', color: '#92400e' }}>Self Upload</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CampDataEntry;
