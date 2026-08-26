import React, { forwardRef } from 'react';
import './Select.css';

/**
 * Select Component - Professional dropdown select
 */
const Select = forwardRef(({
  label,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  fullWidth = false,
  disabled = false,
  required = false,
  className = '',
  children,
  ...props
}, ref) => {
  const containerClassNames = [
    'select-container',
    fullWidth && 'select-container--full-width',
    className
  ].filter(Boolean).join(' ');

  const wrapperClassNames = [
    'select-wrapper',
    error && 'select-wrapper--error',
    disabled && 'select-wrapper--disabled'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassNames}>
      {label && (
        <label className="select-label">
          {label}
          {required && <span className="select-label__required">*</span>}
        </label>
      )}

      <div className={wrapperClassNames}>
        <select
          ref={ref}
          disabled={disabled}
          required={required}
          className="select"
          {...props}
        >
          {placeholder && !children && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children ? children : options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="select-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {(error || helperText) && (
        <div className={`select-message ${error ? 'select-message--error' : ''}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
