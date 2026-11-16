// This file is src/index.js
// This is the correct code for your FRONTEND entry point.

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your global styles
import App from './App.jsx';

// Import the AuthProvider "brain"
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ConfirmationProvider } from './context/ConfirmationContext.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* AuthProvider wraps the entire app.
      This gives every component (like Navbar) access 
      to the user's login state.
    */}
    <AuthProvider>
      <ToastProvider>
        <ConfirmationProvider>
          <App />
        </ConfirmationProvider>
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);