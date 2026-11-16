// This file is src/common/InputField.jsx

import React from 'react';
// We'll use the 'formStyles' from Form.module.css
import formStyles from './Form.module.css';

/**
 * A reusable, styled form input field (label + input).
 * @param {string} label - The text for the <label>
 * @param {string} id - HTML 'id' and 'for' attribute
 * @param {string} type - 'text', 'password', 'email', 'tel', 'date', 'number'
 * @param {string} value - The current value of the input
 * @param {func} onChange - The function to call on change
 * @param {string} [placeholder] - Optional placeholder text
 * @param {bool} [required] - Is the field required?
 * @param {string} [error] - An error message to display
 */
const InputField = ({
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
  required,
  error,
  className = '',
  inputClassName = '',
  labelClassName = ''
}) => {
  return (
    <div className={`${formStyles.formGroup} ${className}`}>
      <label htmlFor={id} className={`${formStyles.label} ${labelClassName}`}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${formStyles.input} ${inputClassName}`}
      />
      {error && <span className={formStyles.errorMessage}>{error}</span>}
    </div>
  );
};

export default InputField;