// This file is src/components/DashboardLayout.jsx
// It acts as the "Shell" - it doesn't need to import specific pages.

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; 
import Sidebar from './Sidebar';           
import DashboardHeader from './DashboardHeader';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={`${styles.layoutGrid} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
      
      <DashboardHeader 
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar} 
      />
      
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        onLinkClick={closeSidebar} 
      />
      
      <main className={styles.content}>
        {/* <Outlet /> automatically swaps in the correct page 
            based on the URL defined in App.jsx */}
        <Outlet /> 
      </main>
      
      {isSidebarOpen && (
        <div 
          className={styles.mobileOverlay} 
          onClick={closeSidebar} 
        />
      )}
    </div>
  );
};

export default DashboardLayout;