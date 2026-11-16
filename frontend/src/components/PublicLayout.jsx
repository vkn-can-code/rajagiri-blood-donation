import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const PublicLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw' }}>
      <Navbar />
      <main style={{ flex: 1, position: 'relative' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
