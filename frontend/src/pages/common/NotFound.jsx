// This file is src/pages/common/NotFound.jsx

import React from 'react';
import { Link } from 'react-router-dom';
// This component uses global CSS classes from src/App.css

const NotFound = () => {
  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;