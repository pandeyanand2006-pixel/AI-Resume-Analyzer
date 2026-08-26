import React, { forwardRef, useState } from 'react';
import './Textarea.css';

/**
 * Textarea Component - ResumeAI Design System
 * Professional multi-line text input
 * 
 * @param {string} label - Label text
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message
 * @param {string} helperText - Helper text below input
 * @param {boolean} fullWidth - Stretch to full width
 * @param {boolean} disabled - Disable input
 * @param {boolean} required - Required field indicator
 * @param {number} rows - Initial number of rows (default: 4)
 * @param {number} maxLength - Maximum character count
 * @param {boolean} showCount - Show character counter
 * @param {string} className - Additional CSS classes
 */
const Textarea = forwardRef(({
  label,
  placeholder,
  error,
  helperText,
  fullWidth = false,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  showCount = false,
  className = '',
  value = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(value?.length || 0);

  const containerClassNames = [
    'textarea-container',
    fullWidth && 'textarea-container--full-width',
    className
  ].filter(Boolean).join(' ');

  const wrapperClassNames = [
    'textarea-wrapper',
    isFocused && 'textarea-wrapper--focused',
    error && 'textarea-wrapper--error',
    disabled && 'textarea-wrapper--disabled'
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    props.onChange?.(e);
  };

  return (
    <div className={containerClassNames}>
      {label && (
        <label className="textarea-label">
          {label}
          {required && <span className="textarea-label__required">*</span>}
        </label>
      )}

      <div className={wrapperClassNames}>
        <textarea
          ref={ref}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className="textarea"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          {...props}
        />
      </div>

      {(error || helperText || (showCount && maxLength)) && (
        <div className="textarea-footer">
          {(error || helperText) && (
            <div className={`textarea-message ${error ? 'textarea-message--error' : ''}`}>
              {error || helperText}
            </div>
          )}
          
          {showCount && maxLength && (
            <div className={`textarea-count ${charCount >= maxLength ? 'textarea-count--limit' : ''}`}>
              {charCount}/{maxLength}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
