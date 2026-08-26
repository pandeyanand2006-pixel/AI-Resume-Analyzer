import React from 'react';
import './Loading.css';

/**
 * Loading Component - ResumeAI Design System
 * Polished skeleton loaders and spinners for all loading scenarios
 * 
 * @param {string} type - spinner | dots | pulse | text | card | table | list | form | image
 * @param {number} count - Number of items to render (for repeating skeletons)
 * @param {number} lines - Number of text lines (for text type)
 * @param {string} size - sm | md | lg (for spinner and avatar)
 * @param {boolean} overlay - Render as overlay
 * @param {boolean} dark - Dark overlay variant
 * @param {string} className - Additional CSS classes
 */
function Loading({ 
  type = 'spinner', 
  count = 1, 
  lines = 3, 
  size = 'md',
  overlay = false,
  dark = false,
  className = '' 
}) {
  // Spinner loader
  if (type === 'spinner') {
    const spinnerClasses = [
      'loading',
      'loading--spinner',
      size !== 'md' && `loading--spinner-${size}`,
      overlay && 'loading--overlay',
      overlay && dark && 'loading--overlay-dark',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={spinnerClasses} role="status" aria-live="polite">
        <div className="loading__spinner" aria-hidden="true"></div>
        <span className="loading__sr-only">Loading...</span>
      </div>
    );
  }

  // Dots loader
  if (type === 'dots') {
    return (
      <div className={`loading loading--dots ${className}`} role="status" aria-live="polite">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span className="loading__sr-only">Loading...</span>
      </div>
    );
  }

  // Pulse loader
  if (type === 'pulse') {
    return (
      <div className={`loading loading--pulse ${className}`} role="status" aria-live="polite">
        <div className="loading__pulse" aria-hidden="true"></div>
        <span className="loading__sr-only">Loading...</span>
      </div>
    );
  }

  // Skeleton text lines
  if (type === 'text') {
    return (
      <div className={`loading loading--text ${className}`} role="status" aria-live="polite">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="loading__line skeleton"
            style={{ 
              width: i === lines - 1 ? '70%' : i === 0 ? '90%' : '100%' 
            }}
            aria-hidden="true"
          ></div>
        ))}
        <span className="loading__sr-only">Loading content...</span>
      </div>
    );
  }

  // Skeleton cards
  if (type === 'card') {
    return (
      <div className={`loading loading--cards ${className}`} role="status" aria-live="polite">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="loading__card" aria-hidden="true">
            <div className="loading__card-header">
              <div className="loading__avatar skeleton"></div>
              <div className="loading__card-title">
                <div className="loading__line skeleton" style={{ width: '70%' }}></div>
                <div className="loading__line skeleton" style={{ width: '50%' }}></div>
              </div>
            </div>
            <div className="loading__card-body">
              <div className="loading__line skeleton"></div>
              <div className="loading__line skeleton"></div>
              <div className="loading__line skeleton" style={{ width: '85%' }}></div>
            </div>
            <div className="loading__card-footer">
              <div className="loading__line skeleton" style={{ width: '100px' }}></div>
              <div className="loading__line skeleton" style={{ width: '100px' }}></div>
            </div>
          </div>
        ))}
        <span className="loading__sr-only">Loading cards...</span>
      </div>
    );
  }

  // Skeleton table
  if (type === 'table') {
    return (
      <div className={`loading loading--table ${className}`} role="status" aria-live="polite">
        <div className="loading__table-header" aria-hidden="true">
          <div className="loading__line skeleton" style={{ width: '20%' }}></div>
          <div className="loading__line skeleton" style={{ width: '40%' }}></div>
          <div className="loading__line skeleton" style={{ width: '15%' }}></div>
          <div className="loading__line skeleton" style={{ width: '25%' }}></div>
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="loading__table-row" aria-hidden="true">
            <div className="loading__line skeleton" style={{ width: '20%' }}></div>
            <div className="loading__line skeleton" style={{ width: '40%' }}></div>
            <div className="loading__line skeleton" style={{ width: '15%' }}></div>
            <div className="loading__line skeleton" style={{ width: '25%' }}></div>
          </div>
        ))}
        <span className="loading__sr-only">Loading table data...</span>
      </div>
    );
  }

  // Skeleton list
  if (type === 'list') {
    return (
      <div className={`loading loading--list ${className}`} role="status" aria-live="polite">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="loading__list-item" aria-hidden="true">
            <div className="loading__avatar skeleton"></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div className="loading__line skeleton" style={{ width: '60%' }}></div>
              <div className="loading__line skeleton" style={{ width: '40%' }}></div>
            </div>
          </div>
        ))}
        <span className="loading__sr-only">Loading list...</span>
      </div>
    );
  }

  // Skeleton form
  if (type === 'form') {
    return (
      <div className={`loading loading--form ${className}`} role="status" aria-live="polite">
        {Array.from({ length: count || 4 }).map((_, i) => (
          <div key={i} className="loading__form-field" aria-hidden="true">
            <div className="loading__line skeleton loading__form-label"></div>
            <div className="loading__line skeleton loading__form-input"></div>
          </div>
        ))}
        <span className="loading__sr-only">Loading form...</span>
      </div>
    );
  }

  // Skeleton image
  if (type === 'image') {
    return (
      <div 
        className={`loading__image skeleton loading__image--${size} ${className}`}
        role="status" 
        aria-live="polite"
      >
        <span className="loading__sr-only">Loading image...</span>
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`loading ${className}`} role="status" aria-live="polite">
      <span>Loading...</span>
    </div>
  );
}

/* ============================================
   PRESET LOADING COMPONENTS
============================================ */

/**
 * Spinner - Default spinner loader
 */
Loading.Spinner = ({ size = 'md', overlay = false, dark = false, className = '' }) => (
  <Loading type="spinner" size={size} overlay={overlay} dark={dark} className={className} />
);

/**
 * Dots - Three dot bouncing loader
 */
Loading.Dots = ({ className = '' }) => (
  <Loading type="dots" className={className} />
);

/**
 * Pulse - Pulsing circle loader
 */
Loading.Pulse = ({ className = '' }) => (
  <Loading type="pulse" className={className} />
);

/**
 * Text - Skeleton text lines
 */
Loading.Text = ({ lines = 3, className = '' }) => (
  <Loading type="text" lines={lines} className={className} />
);

/**
 * Card - Skeleton card grid
 */
Loading.Card = ({ count = 3, className = '' }) => (
  <Loading type="card" count={count} className={className} />
);

/**
 * Table - Skeleton table rows
 */
Loading.Table = ({ count = 5, className = '' }) => (
  <Loading type="table" count={count} className={className} />
);

/**
 * List - Skeleton list items
 */
Loading.List = ({ count = 5, className = '' }) => (
  <Loading type="list" count={count} className={className} />
);

/**
 * Form - Skeleton form fields
 */
Loading.Form = ({ count = 4, className = '' }) => (
  <Loading type="form" count={count} className={className} />
);

/**
 * Image - Skeleton image placeholder
 */
Loading.Image = ({ size = 'md', className = '' }) => (
  <Loading type="image" size={size} className={className} />
);

/**
 * Inline - Inline spinner for buttons/inputs
 */
Loading.Inline = ({ className = '' }) => (
  <div className={`loading loading--inline ${className}`} role="status">
    <div className="loading__spinner" aria-hidden="true"></div>
    <span className="loading__sr-only">Loading...</span>
  </div>
);

/**
 * Overlay - Full overlay with spinner
 */
Loading.Overlay = ({ dark = false, className = '' }) => (
  <Loading type="spinner" overlay={true} dark={dark} className={className} />
);

/**
 * Page - Full page loading state
 */
Loading.Page = ({ message = 'Loading...', className = '' }) => (
  <div 
    className={`loading loading--spinner ${className}`}
    style={{ minHeight: '400px' }}
    role="status" 
    aria-live="polite"
  >
    <div style={{ textAlign: 'center' }}>
      <div className="loading__spinner" style={{ margin: '0 auto' }} aria-hidden="true"></div>
      {message && (
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--text-secondary)' }}>
          {message}
        </p>
      )}
    </div>
  </div>
);

export default Loading;
