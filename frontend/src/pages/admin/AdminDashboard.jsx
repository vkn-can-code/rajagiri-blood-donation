// This file is src/pages/admin/AdminDashboard.jsx
// --- REDESIGNED ADMIN DASHBOARD ---

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllUsers, getAllBatches, getAllRequestsAdmin } from '../../services/adminService';
import styles from './AdminDashboard.module.css';
import Spinner from '../common/Spinner';
import { Users, FileText, Layers, Activity, Droplet, Heart, ChevronRight, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, batches: 0, requests: 0, unitsDonated: 0, certificatesPending: 0 });
  const [allRequestsRaw, setAllRequestsRaw] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [chartFilter, setChartFilter] = useState('This Month');
  const [doughnutData, setDoughnutData] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const usersData = await getAllUsers();
        const batchesData = await getAllBatches();
        const allRequestsData = await getAllRequestsAdmin(); // includes RequestResponses

        // 1. Calculate Summary Stats
        const activeRequests = allRequestsData.filter(r => r.status === 'open').length;
        
        let totalUnitsDonated = 0;
        let pendingCertificates = 0;
        const donorTallies = {}; // { userId: { name: string, count: number } }
        const bloodTypeCounts = { 'O+': 0, 'A+': 0, 'B+': 0, 'AB+': 0, 'Others': 0 };

        allRequestsData.forEach(request => {
          // Accumulate line chart data later...
          
          if (request.RequestResponses) {
            request.RequestResponses.forEach(response => {
              if (response.status === 'accepted') {
                totalUnitsDonated += 1;
                
                // Top Donors Tally
                if (response.User) {
                  if (!donorTallies[response.User.id]) {
                    donorTallies[response.User.id] = { id: response.User.id, name: response.User.name, count: 0 };
                  }
                  donorTallies[response.User.id].count += 1;
                }

                // Certificates Pending
                if (response.certificate_status !== 'granted') {
                  pendingCertificates += 1;
                }
                
                // Doughnut Chart Data (by requested blood group)
                const bg = request.required_blood_group;
                if (bloodTypeCounts[bg] !== undefined) {
                  bloodTypeCounts[bg] += 1;
                } else {
                  bloodTypeCounts['Others'] += 1;
                }
              }
            });
          }
        });

        setStats({
          users: usersData.length,
          batches: batchesData.length,
          requests: activeRequests,
          unitsDonated: totalUnitsDonated,
          certificatesPending: pendingCertificates
        });

        // 2. Top Donors List (Sort and take top 3)
        const sortedDonors = Object.values(donorTallies).sort((a, b) => b.count - a.count).slice(0, 3);
        setTopDonors(sortedDonors);

        // 3. Doughnut Data Format
        const doughnutColors = {
          'O+': '#eb5757',
          'A+': '#2f80ed',
          'B+': '#219653',
          'AB+': '#9b51e0',
          'Others': '#f2994a'
        };
        const newDoughnutData = Object.entries(bloodTypeCounts)
          .filter(([name, value]) => value > 0)
          .map(([name, value]) => ({ name, value, color: doughnutColors[name] }));
        
        setDoughnutData(newDoughnutData.length > 0 ? newDoughnutData : [{ name: 'No Data', value: 1, color: '#ccc' }]);

        // 4. Store raw requests for filtering later
        setAllRequestsRaw(allRequestsData);

        // 5. Recent Requests Format
        const sortedRequests = [...allRequestsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        const mappedRecent = sortedRequests.map(r => ({
          id: r.id,
          hospital: r.hospital_name,
          units: `${r.units_required} Unit${r.units_required > 1 ? 's' : ''}`,
          time: new Date(r.required_date || r.createdAt).toLocaleDateString(),
          type: r.required_blood_group,
          status: r.status === 'open' ? 'urgent' : 'normal'
        }));
        setRecentRequests(mappedRecent);

      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Re-compute line chart whenever filter or raw data changes
  useEffect(() => {
    if (allRequestsRaw.length === 0) return;

    const now = new Date();
    let filtered;

    if (chartFilter === 'This Month') {
      filtered = allRequestsRaw.filter(r => {
        const d = new Date(r.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
    } else if (chartFilter === 'Last Month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filtered = allRequestsRaw.filter(r => {
        const d = new Date(r.createdAt);
        return d.getFullYear() === lastMonth.getFullYear() && d.getMonth() === lastMonth.getMonth();
      });
    } else { // This Year
      filtered = allRequestsRaw.filter(r => {
        const d = new Date(r.createdAt);
        return d.getFullYear() === now.getFullYear();
      });
    }

    const dateGroups = {};
    filtered.forEach(r => {
      const d = new Date(r.createdAt);
      const dateStr = chartFilter === 'This Year'
        ? d.toLocaleDateString('en-US', { month: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateGroups[dateStr]) dateGroups[dateStr] = 0;
      dateGroups[dateStr] += 1;
    });

    const sortedDates = Object.keys(dateGroups).sort((a, b) => new Date(a + ' 2000') - new Date(b + ' 2000'));
    const newLineData = sortedDates.map(date => ({ name: date, requests: dateGroups[date] }));
    setLineChartData(newLineData.length > 0 ? newLineData : [{ name: 'No data', requests: 0 }]);
  }, [chartFilter, allRequestsRaw]);

  if (isLoading || !user) return <Spinner />;

  return (
    <div className={styles.dashboardContainer}>

      {/* --- Hero / Welcome Section --- */}
      <header className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Dashboard</h1>
        <p className={styles.heroSubtitle}>Overview of blood donation activities</p>
      </header>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* --- Stats Grid --- */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statCardInner}>
            <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
              <Droplet size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.requests}</span>
              <span className={styles.statLabel}>Active Blood Requests</span>
              <span className={`${styles.trend} ${styles.up}`}>↑ 12% <span className={styles.trendText}>from last month</span></span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardInner}>
             <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
              <Users size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.users}</span>
              <span className={styles.statLabel}>Registered Donors</span>
              <span className={`${styles.trend} ${styles.up}`}>↑ 8% <span className={styles.trendText}>from last month</span></span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardInner}>
             <div className={`${styles.iconWrapper} ${styles.iconRed}`}>
              <Heart size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.unitsDonated}</span>
              <span className={styles.statLabel}>Units Donated</span>
              <span className={`${styles.trend} ${styles.up}`}>↑ 15% <span className={styles.trendText}>from last month</span></span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardInner}>
             <div className={`${styles.iconWrapper} ${styles.iconOrange}`}>
              <FileText size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.certificatesPending}</span>
              <span className={styles.statLabel}>Certificates Pending</span>
              <span className={`${styles.trend} ${styles.down}`}>↓ 5% <span className={styles.trendText}>from last month</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Main Content Grid --- */}
      <section className={styles.mainGrid}>
        {/* Line Chart Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Blood Requests Overview</h2>
            <select
              className={styles.dropdownSelect}
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="requests" stroke="#219653" strokeWidth={3} dot={{ r: 4, fill: '#219653', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Requests Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Blood Requests</h2>
            <Link to="/admin/requests" className={styles.cardAction}>View All</Link>
          </div>
          <div className={styles.listContainer}>
            {recentRequests.map(req => (
              <div key={req.id} className={styles.listItem}>
                <div className={styles.requestInfo}>
                  <div className={`${styles.bloodTypeBadge} ${styles[req.type.replace('+', '_pos').replace('-', '_neg')] || styles.O_pos}`}>
                    {req.type}
                  </div>
                  <div className={styles.requestDetails}>
                    <span className={styles.requestHospital}>{req.hospital}</span>
                    <span className={styles.requestMeta}>{req.units} • {req.time}</span>
                  </div>
                </div>
                <div className={`${styles.statusBadge} ${styles[req.status]}`}>
                  {req.status === 'urgent' ? 'Urgent' : 'Normal'}
                </div>
              </div>
            ))}
            <Link to="/admin/requests" className={styles.cardAction} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
              View All Requests <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* --- Bottom Grid --- */}
      <section className={styles.bottomGrid}>
        {/* Doughnut Chart Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Donations This Month</h2>
          </div>
          <div className={styles.doughnutContainer}>
            <div className={styles.doughnutChartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={doughnutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {doughnutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.doughnutCenterLabel}>
                <span className={styles.doughnutCenterValue}>{stats.unitsDonated}</span>
                <span className={styles.doughnutCenterText}>Units</span>
              </div>
            </div>
            
            <div className={styles.legendContainer}>
              {doughnutData.map((item, i) => {
                if (item.name === 'No Data') return null;
                const total = doughnutData.reduce((acc, curr) => acc + curr.value, 0);
                const percent = Math.round((item.value / total) * 100);
                return (
                  <div key={i} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ backgroundColor: item.color }}></span>
                    <span className={styles.legendLabel}>{item.name}</span>
                    <span className={styles.legendValue}>{item.value}</span>
                    <span className={styles.legendPercentage}>({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Donors Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Top Donors</h2>
            <Link to="/admin/users" className={styles.cardAction}>View All</Link>
          </div>
          <div className={styles.listContainer}>
            {topDonors.map((donor, idx) => (
              <div key={donor.id} className={styles.listItem}>
                <div className={styles.donorInfo}>
                  <div className={styles.donorRank}>{idx + 1}</div>
                  <div className={styles.donorAvatar}>
                    <User size={16} />
                  </div>
                  <span className={styles.donorName}>{donor.name}</span>
                </div>
                <div className={styles.donationsCount}>
                  {donor.count} Donations
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AdminDashboard;
