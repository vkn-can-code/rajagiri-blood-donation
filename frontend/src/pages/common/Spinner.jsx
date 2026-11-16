// This file is src/common/Spinner.jsx

import React from 'react';
import styles from './Spinner.module.css';

/**
 * A simple loading spinner component.
 * @param {string} size - 'small' or 'large' (default)
 */
const Spinner = ({ size = 'large' }) => {
  const sizeClass = size === 'small' ? styles.small : styles.large;
  
  return (
    <div className={`${styles.spinnerContainer} ${sizeClass}`}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default Spinner;