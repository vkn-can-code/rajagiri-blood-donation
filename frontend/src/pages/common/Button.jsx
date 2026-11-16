// This file is src/common/Button.jsx

import React from 'react';
import styles from './Button.module.css';

/**
 * A reusable Button component.
 * @param {node} children - What's inside the button (e.g., text, an icon)
 * @param {func} onClick - The function to call when clicked
 * @param {string} type - 'button', 'submit', or 'reset'
 * @param {string} variant - 'primary' (green) or 'secondary' (white)
 * @param {bool} disabled - Is the button disabled?
 * @param {string} [className] - Optional extra classNames
 */
const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled, 
  className = '' 
}) => {
  
  // Automatically select the correct CSS class based on the 'variant' prop
  const variantClass = variant === 'primary' ? styles.primary : styles.secondary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // Combine the base 'btn' class, the 'variantClass', and any extra classes
      className={`${styles.btn} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;