// This file is src/pages/common/Unauthorized.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Unauthorized.module.css'; // Import the new CSS file

const Unauthorized = () => {
  const navigate = useNavigate();

  // This function sends the user back to the previous page
  const goBack = () => navigate(-1);

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">!</div>
        <h1 className="unauthorized-title">Access Denied</h1>
        <p className="unauthorized-text">
          You do not have the necessary permissions to view this page.
        </p>
        <div className="unauthorized-actions">
          <button onClick={goBack} className="btn btn-secondary">
            Go Back
          </button>
          <Link to="/dashboard" className="btn btn-primary">
            Go to My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;