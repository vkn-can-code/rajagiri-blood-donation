// This file is src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import './App.css';

// Layouts
import Navbar from './components/Navbar.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import PublicLayout from './components/PublicLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AutoRedirect from './components/AutoRedirect.jsx';

// Public Pages
import PublicRequests from './pages/public/PublicRequests.jsx';
import PublicCamps from './pages/public/PublicCamps.jsx';
import ContactUs from './pages/public/ContactUs.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import Unauthorized from './pages/common/Unauthorized.jsx';
import NotFound from './pages/common/NotFound.jsx';

// Common Pages
import Notifications from './pages/common/Notifications.jsx';
import RequestResponse from './pages/public/RequestResponse.jsx';
import Profile from './pages/common/Profile.jsx';
import History from './pages/common/History.jsx';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import BatchManagement from './pages/admin/BatchManagement.jsx';
import DepartmentManagement from './pages/admin/DepartmentManagement.jsx';
import RequestManagement from './pages/admin/RequestManagement.jsx';
import RequestList from './pages/admin/RequestList.jsx';
import CampManagement from './pages/admin/CampManagement.jsx';
import CampDetails from './pages/admin/CampDetails.jsx';
import CampDataEntry from './pages/admin/CampDataEntry.jsx';
import AdminPrivileges from './pages/admin/AdminPrivileges.jsx';
import EmailManagement from './pages/admin/EmailManagement.jsx';
import Settings from './pages/admin/Settings.jsx';
import PendingReminders from './pages/admin/PendingReminders.jsx';
import UserAnalytics from './pages/admin/UserAnalytics.jsx';
import UserAnalyticsIndex from './pages/admin/UserAnalyticsIndex.jsx';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import MyDonations from './pages/student/MyDonations.jsx';
import FacultyDashboard from './pages/faculty/FacultyDashboard.jsx';
import MyClass from './pages/faculty/MyClass.jsx';
import PendingDonations from './pages/faculty/PendingDonations.jsx';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="requests" element={<PublicRequests />} />
          <Route path="camps" element={<PublicCamps />} />
          <Route path="contact" element={<ContactUs />} />
          {/* If there was a home page, it would go here. For now, / routes to dashboard. */}
        </Route>

        {/* DASHBOARD ROUTES (Sidebar & Header applied here) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default Redirect to Dashboard based on Role */}
          <Route index element={<AutoRedirect />} />

          {/* 1. Common Dashboard Pages */}
          <Route path="dashboard" element={<AutoRedirect />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="history" element={<History />} />
          <Route path="requests/:id/respond" element={<RequestResponse />} />

          {/* 2. Student Pages */}
          <Route path="student/dashboard" element={<StudentDashboard />} />
          <Route path="student/my-donations" element={<MyDonations />} />

          {/* 3. Faculty Admin Pages */}
          <Route path="faculty_admin/dashboard" element={<FacultyDashboard />} />
          <Route path="faculty_admin/my-class" element={<MyClass />} />
          <Route path="faculty_admin/pending-donations" element={<PendingDonations />} />

          {/* 4. Volunteer Pages */}
          <Route path="volunteer/dashboard" element={<VolunteerDashboard />} />

          {/* 5. Admin Pages */}
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/users" element={<UserManagement />} />
          <Route path="admin/user-analytics" element={<UserAnalyticsIndex />} />
          <Route path="admin/users/:userId/analytics" element={<UserAnalytics />} />
          <Route path="admin/batches" element={<BatchManagement />} />
          <Route path="admin/departments" element={<DepartmentManagement />} />
          <Route path="admin/requests" element={<RequestManagement />} />
          <Route path="admin/request-list" element={<RequestList />} />
          <Route path="admin/camps" element={<CampManagement />} />
          <Route path="admin/camps/:id" element={<CampDetails />} />
          <Route path="admin/camps/:id/data-entry" element={<CampDataEntry />} />
          <Route path="admin/privileges" element={<AdminPrivileges />} />
          <Route path="admin/emails" element={<EmailManagement />} />
          <Route path="admin/settings" element={<Settings />} />
          <Route path="admin/pending-reminders" element={<PendingReminders />} />
        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;