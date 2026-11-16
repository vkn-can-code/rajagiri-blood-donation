// src/pages/admin/UserAnalytics.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserAnalytics } from '../../services/adminService';
import styles from './UserAnalytics.module.css';
import Spinner from '../common/Spinner';

// ── Palette ──────────────────────────────────────────────────
const BLOOD_COLORS = {
  'A+': '#dc2626', 'A-': '#b91c1c',
  'B+': '#2563eb', 'B-': '#1d4ed8',
  'O+': '#059669', 'O-': '#047857',
  'AB+': '#7c3aed', 'AB-': '#6d28d9',
};
const AVATAR_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const bgColor     = (bg) => BLOOD_COLORS[bg] || '#6b7280';

// ── Formatters ───────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

const fmtMonthYear = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { month:'long', year:'numeric' }) : '';

const getISO = (d) => (d ? new Date(d).toISOString() : '');

// ── Status Config ────────────────────────────────────────────
const STATUS_CFG = {
  approved:      { label:'Approved',      bg:'#dcfce7', color:'#15803d', dot:'#16a34a' },
  rejected:      { label:'Rejected',      bg:'#fee2e2', color:'#b91c1c', dot:'#dc2626' },
  pending:       { label:'Pending',       bg:'#fef9c3', color:'#854d0e', dot:'#ca8a04' },
  open:          { label:'Open',          bg:'#eff6ff', color:'#1d4ed8', dot:'#2563eb' },
  fulfilled:     { label:'Fulfilled',     bg:'#dcfce7', color:'#15803d', dot:'#16a34a' },
  closed:        { label:'Closed',        bg:'#f3f4f6', color:'#6b7280', dot:'#9ca3af' },
  new:           { label:'New',           bg:'#eff6ff', color:'#1d4ed8', dot:'#2563eb' },
  contacted:     { label:'Contacted',     bg:'#fef3c7', color:'#92400e', dot:'#d97706' },
  accepted:      { label:'Accepted',      bg:'#dcfce7', color:'#15803d', dot:'#16a34a' },
  auto_rejected: { label:'Auto Rejected', bg:'#fee2e2', color:'#b91c1c', dot:'#dc2626' },
};

const Badge = ({ status }) => {
  const c = STATUS_CFG[status] || { label: status || '—', bg:'#f3f4f6', color:'#6b7280', dot:'#9ca3af' };
  return (
    <span className={styles.badge} style={{ background: c.bg, color: c.color }}>
      <span className={styles.badgeDot} style={{ background: c.dot }} />
      {c.label}
    </span>
  );
};

// ── Activity Type Config ─────────────────────────────────────
const TYPE_CFG = {
  donation:     { label:'Donation',          accent:'#16a34a', lightBg:'#f0fdf4', borderColor:'#86efac' },
  request:      { label:'Blood Request',     accent:'#2563eb', lightBg:'#eff6ff', borderColor:'#93c5fd' },
  response:     { label:'Response Given',    accent:'#7c3aed', lightBg:'#f5f3ff', borderColor:'#c4b5fd' },
  registration: { label:'Camp Registration', accent:'#d97706', lightBg:'#fffbeb', borderColor:'#fcd34d' },
};

// ── Activity Card ─────────────────────────────────────────────
const ActivityCard = ({ item }) => {
  const cfg = TYPE_CFG[item.type];
  return (
    <div className={styles.actCard} style={{ borderLeft: `4px solid ${cfg.accent}`, background: cfg.lightBg }}>
      {/* Left: type dot + icon */}
      <div className={styles.actIconWrap} style={{ background: cfg.accent + '20', color: cfg.accent }}>
        {item.icon}
      </div>

      {/* Middle: content */}
      <div className={styles.actContent}>
        <div className={styles.actHeader}>
          <span className={styles.actTypePill} style={{ background: cfg.accent + '15', color: cfg.accent }}>
            {cfg.label}
          </span>
          <span className={styles.actDate}>{fmtDate(item.date)}</span>
        </div>
        <p className={styles.actTitle}>{item.title}</p>
        {item.subtitle && <p className={styles.actSub}>{item.subtitle}</p>}
        {item.meta && (
          <div className={styles.actMetaRow}>
            {item.meta.map((m, i) => m && (
              <span key={i} className={styles.actMetaChip}>{m}</span>
            ))}
          </div>
        )}
      </div>

      {/* Right: status */}
      <div className={styles.actStatus}>
        <Badge status={item.status} />
      </div>
    </div>
  );
};

// ── SVG Icons ────────────────────────────────────────────────
const IconDrop = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);
const IconRequest = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconResponse = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const IconCamp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
const UserAnalytics = () => {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const [data, setData]         = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState('all');   // all | donation | request | response | registration
  const [search, setSearch]     = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await getUserAnalytics(userId));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // ── Build unified timeline ───────────────────────────────
  const timeline = useMemo(() => {
    if (!data) return [];
    const items = [];

    data.donations.forEach(d => items.push({
      id: `don-${d.id}`,
      type: 'donation',
      date: d.donation_date || d.createdAt,
      status: d.status,
      title: d.Camp ? `Donated at ${d.Camp.title}` : 'Donation',
      subtitle: d.Camp ? `${d.Camp.location}` : 'Self-uploaded certificate',
      meta: [
        d.description || null,
        d.certificate_url === 'camp_entry' ? 'Camp Entry' : 'Self Upload',
      ],
      icon: <IconDrop />,
    }));

    data.bloodRequests.forEach(r => items.push({
      id: `req-${r.id}`,
      type: 'request',
      date: r.createdAt,
      status: r.status,
      title: `Requested blood for ${r.patient_name}`,
      subtitle: r.hospital_name,
      meta: [
        r.required_blood_group ? `${r.required_blood_group}` : null,
        r.units_required ? `${r.units_required} unit${r.units_required > 1 ? 's' : ''} needed` : null,
        r.required_date ? `Required by ${fmtDate(r.required_date)}` : null,
      ],
      icon: <IconRequest />,
    }));

    data.requestResponses.forEach(r => items.push({
      id: `resp-${r.id}`,
      type: 'response',
      date: r.createdAt,
      status: r.status,
      title: `Responded to request for ${r.BloodRequest?.patient_name || 'a patient'}`,
      subtitle: r.BloodRequest?.hospital_name || null,
      meta: [
        r.BloodRequest?.required_blood_group ? `${r.BloodRequest.required_blood_group}` : null,
        r.message || null,
      ],
      icon: <IconResponse />,
    }));

    data.campRegistrations.forEach(r => items.push({
      id: `reg-${r.id}`,
      type: 'registration',
      date: r.createdAt,
      status: r.status,
      title: `Registered for ${r.Camp?.title || 'a camp'}`,
      subtitle: r.Camp ? `${r.Camp.location} · ${fmtDate(r.Camp.camp_date)}` : null,
      meta: [],
      icon: <IconCamp />,
    }));

    // Sort newest first
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data]);

  // ── Filter + Search ──────────────────────────────────────
  const visible = useMemo(() => {
    let out = timeline;
    if (filter !== 'all') out = out.filter(i => i.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.subtitle || '').toLowerCase().includes(q) ||
        (i.meta || []).some(m => (m || '').toLowerCase().includes(q))
      );
    }
    return out;
  }, [timeline, filter, search]);

  // ── Group by month ───────────────────────────────────────
  const grouped = useMemo(() => {
    const map = {};
    visible.forEach(item => {
      const key = fmtMonthYear(item.date);
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [visible]);

  if (isLoading) return <Spinner />;

  if (error) return (
    <div className={styles.pageWrap}>
      <div className={styles.errCard}>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>Go Back</button>
      </div>
    </div>
  );

  const { user, stats } = data;
  const ac  = avatarColor(user.name);
  const bgC = bgColor(user.blood_group);

  const TYPE_FILTERS = [
    { key:'all',          label:'All Activity',      count: timeline.length },
    { key:'donation',     label:'Donations',         count: data.donations.length },
    { key:'request',      label:'Requests',          count: data.bloodRequests.length },
    { key:'response',     label:'Responses',         count: data.requestResponses.length },
    { key:'registration', label:'Camp Registrations',count: data.campRegistrations.length },
  ];

  return (
    <div className={styles.pageWrap}>

      {/* ── Top nav ── */}
      <div className={styles.topNav}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>
        <span className={styles.breadcrumb}>User Analytics</span>
      </div>

      {/* ════════════════════════════════════
          PROFILE CARD
      ════════════════════════════════════ */}
      <div className={styles.profileCard}>
        {/* Accent bar */}
        <div className={styles.profileAccentBar} style={{ background: ac }} />

        <div className={styles.profileInner}>
          {/* Avatar */}
          <div className={styles.profileAvatarWrap}>
            <div className={styles.profileAvatar} style={{ background: ac }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            {user.has_donated && (
              <div className={styles.donorBadgeRing} title="Verified Donor">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#15803d">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.profileInfo}>
            <div className={styles.profileNameRow}>
              <h1 className={styles.profileName}>{user.name}</h1>
              <div className={styles.profileTags}>
                <span className={styles.roleTag}>{(user.role || '').replace(/_/g, ' ')}</span>
                {user.blood_group && (
                  <span className={styles.bloodTag} style={{ background: bgC }}>{user.blood_group}</span>
                )}
                {user.has_donated && <span className={styles.donorTag}>Verified Donor</span>}
              </div>
            </div>

            <div className={styles.profileMeta}>
              {user.email && (
                <span className={styles.metaItem}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
                  {user.email}
                </span>
              )}
              {user.phone_number && (
                <span className={styles.metaItem}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1.17h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9a16 16 0 006.29 6.29l1.19-1.19a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  {user.phone_number}
                </span>
              )}
              {user.StudentBatch && (
                <span className={styles.metaItem}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                  {user.StudentBatch.Department?.name && `${user.StudentBatch.Department.name} · `}{user.StudentBatch.batch_name}
                </span>
              )}
            </div>

            {user.last_donation_date && (
              <p className={styles.lastDonated}>
                Last donated on {fmtDate(user.last_donation_date)}
              </p>
            )}
          </div>

          {/* Quick stats */}
          <div className={styles.profileQuickStats}>
            <div className={styles.qStat}>
              <span className={styles.qStatNum} style={{ color:'#16a34a' }}>{stats.approvedDonations}</span>
              <span className={styles.qStatLbl}>Donations</span>
            </div>
            <div className={styles.qStatDiv} />
            <div className={styles.qStat}>
              <span className={styles.qStatNum} style={{ color:'#dc2626' }}>
                {stats.totalBloodUnits}
                <span style={{ fontSize: '0.7rem', fontWeight: 600, marginLeft: 2 }}>unit{stats.totalBloodUnits !== 1 ? 's' : ''}</span>
              </span>
              <span className={styles.qStatLbl}>Blood Donated</span>
            </div>
            <div className={styles.qStatDiv} />
            <div className={styles.qStat}>
              <span className={styles.qStatNum} style={{ color:'#2563eb' }}>{stats.totalRequests}</span>
              <span className={styles.qStatLbl}>Requests</span>
            </div>
            <div className={styles.qStatDiv} />
            <div className={styles.qStat}>
              <span className={styles.qStatNum} style={{ color:'#7c3aed' }}>{stats.acceptedResponses}</span>
              <span className={styles.qStatLbl}>Responses</span>
            </div>
            <div className={styles.qStatDiv} />
            <div className={styles.qStat}>
              <span className={styles.qStatNum} style={{ color:'#d97706' }}>{stats.campRegistrations}</span>
              <span className={styles.qStatLbl}>Camps</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          INSIGHT CHIPS
      ════════════════════════════════════ */}
      {(stats.rejectedDonations > 0 || stats.pendingDonations > 0 || stats.fulfilledRequests > 0 || stats.totalBloodUnits > 0) && (
        <div className={styles.insightRow}>
          {stats.totalBloodUnits > 0 && (
            <div className={styles.insightChip} style={{ borderColor:'#fca5a5', background:'#fef2f2', color:'#b91c1c' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
              {stats.totalBloodUnits} blood unit{stats.totalBloodUnits !== 1 ? 's' : ''} donated in total
            </div>
          )}
          {stats.approvedDonations > 0 && (
            <div className={styles.insightChip} style={{ borderColor:'#86efac', background:'#f0fdf4', color:'#15803d' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {stats.approvedDonations} successful donation{stats.approvedDonations > 1 ? 's' : ''}
            </div>
          )}
          {stats.rejectedDonations > 0 && (
            <div className={styles.insightChip} style={{ borderColor:'#fca5a5', background:'#fef2f2', color:'#b91c1c' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {stats.rejectedDonations} rejected donation{stats.rejectedDonations > 1 ? 's' : ''}
            </div>
          )}
          {stats.pendingDonations > 0 && (
            <div className={styles.insightChip} style={{ borderColor:'#fcd34d', background:'#fffbeb', color:'#92400e' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
              {stats.pendingDonations} pending approval
            </div>
          )}
          {stats.fulfilledRequests > 0 && (
            <div className={styles.insightChip} style={{ borderColor:'#93c5fd', background:'#eff6ff', color:'#1d4ed8' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"/></svg>
              {stats.fulfilledRequests} blood request fulfilled
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════
          ACTIVITY TIMELINE
      ════════════════════════════════════ */}
      <div className={styles.timelineCard}>

        {/* Timeline toolbar */}
        <div className={styles.timelineToolbar}>
          <div className={styles.filterPills}>
            {TYPE_FILTERS.map(f => (
              <button
                key={f.key}
                className={`${styles.filterPill} ${filter === f.key ? styles.filterPillActive : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <span className={`${styles.filterCount} ${filter === f.key ? styles.filterCountActive : ''}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search activity..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>&#x2715;</button>
            )}
          </div>
        </div>

        {/* Timeline body */}
        <div className={styles.timelineBody}>
          {visible.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className={styles.emptyTitle}>No activity found</p>
              <p className={styles.emptySub}>
                {search ? 'Try clearing the search.' : 'This user has no recorded activity yet.'}
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([month, items]) => (
              <div key={month} className={styles.monthGroup}>
                <div className={styles.monthLabel}>
                  <span>{month}</span>
                  <span className={styles.monthCount}>{items.length} event{items.length > 1 ? 's' : ''}</span>
                </div>
                <div className={styles.monthItems}>
                  {items.map(item => <ActivityCard key={item.id} item={item} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
