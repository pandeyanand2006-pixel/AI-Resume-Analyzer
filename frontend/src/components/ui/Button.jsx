import React from 'react';
import './Button.css';

/**
 * Button Component - ResumeAI Design System
 * Professional, accessible buttons with multiple variants and sizes
 * 
 * @param {string} variant - primary | secondary | ghost | outline | danger | success | ai
 * @param {string} size - sm | md | lg
 * @param {boolean} fullWidth - Stretch button to full width
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button interactions
 * @param {ReactNode} icon - Icon element (SVG or component)
 * @param {string} iconPosition - left | right
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Click handler
 * @param {string} type - button | submit | reset
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const classNames = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full-width',
    loading && 'btn--loading',
    disabled && 'btn--disabled',
    icon && !children && 'btn--icon-only',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      type={type}
      className={classNames}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          <svg 
            className="btn__spinner-icon" 
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="btn__spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
        </span>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn__icon btn__icon--left" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {children && <span className="btn__text">{children}</span>}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn__icon btn__icon--right" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;
