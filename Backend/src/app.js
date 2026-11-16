// This file is src/app.js
const express = require('express');
const path = require('path');
const cors = require('cors');

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campRoutes = require('./routes/campRoutes');
const bloodRequestRoutes = require('./routes/bloodRequestRoutes');
const donationRoutes = require('./routes/donationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const facultyAdminRoutes = require('./routes/facultyAdminRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();

// Trust Proxy
app.set('trust proxy', 1);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(express.json());

// --- DEBUG: Log every request to terminal ---
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url} | Origin: ${req.headers.origin}`);
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Rajagiri Blood Donation API is running!' });
});

// --- Mount Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/requests', bloodRequestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty_admin', facultyAdminRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/history', historyRoutes);

module.exports = app;