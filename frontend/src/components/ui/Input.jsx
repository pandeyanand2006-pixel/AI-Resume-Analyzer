import React, { forwardRef, useState } from 'react';
import './Input.css';

/**
 * Input Component - ResumeAI Design System
 * Professional form inputs with validation and icons
 * 
 * @param {string} label - Label text
 * @param {string} type - text | email | password | number | tel | url | search
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message
 * @param {string} helperText - Helper text below input
 * @param {ReactNode} icon - Icon element (SVG or component)
 * @param {string} iconPosition - left | right
 * @param {boolean} fullWidth - Stretch to full width
 * @param {boolean} disabled - Disable input
 * @param {boolean} required - Required field indicator
 * @param {string} className - Additional CSS classes
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const containerClassNames = [
    'input-container',
    fullWidth && 'input-container--full-width',
    className
  ].filter(Boolean).join(' ');

  const wrapperClassNames = [
    'input-wrapper',
    isFocused && 'input-wrapper--focused',
    error && 'input-wrapper--error',
    disabled && 'input-wrapper--disabled',
    icon && `input-wrapper--icon-${iconPosition}`
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassNames}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-label__required">*</span>}
        </label>
      )}

      <div className={wrapperClassNames}>
        {icon && iconPosition === 'left' && (
          <span className="input-icon input-icon--left" aria-hidden="true">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="input"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error || helperText ? `${props.id}-message` : undefined}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            className="input-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}

        {icon && iconPosition === 'right' && type !== 'password' && (
          <span className="input-icon input-icon--right" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      {(error || helperText) && (
        <div 
          id={`${props.id}-message`}
          className={`input-message ${error ? 'input-message--error' : ''}`}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
