import React from 'react';
import './Card.css';

/**
 * Card Component - ResumeAI Design System
 * Professional container with consistent elevation and styling
 * 
 * @param {string} variant - default | elevated | outlined | interactive | flat | ai
 * @param {boolean} hover - Enable hover effect
 * @param {string} padding - none | sm | md | lg | xl
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Click handler (makes card clickable)
 */
const Card = ({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
  onClick,
  role,
  tabIndex,
  ...props
}) => {
  const classNames = [
    'card',
    `card--${variant}`,
    `card--padding-${padding}`,
    hover && 'card--hover',
    onClick && 'card--clickable',
    className
  ].filter(Boolean).join(' ');

  // Determine appropriate role and tabIndex for clickable cards
  const isClickable = !!onClick;
  const cardRole = role || (isClickable ? 'button' : undefined);
  const cardTabIndex = tabIndex !== undefined ? tabIndex : (isClickable ? 0 : undefined);

  const handleKeyPress = (e) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.(e);
    }
  };

  return (
    <div
      className={classNames}
      onClick={onClick}
      role={cardRole}
      tabIndex={cardTabIndex}
      onKeyPress={handleKeyPress}
      {...props}
    >
      {children}
    </div>
  );
};

/* ============================================
   CARD SUBCOMPONENTS
============================================ */

/**
 * Card Header - Top section with optional border
 */
Card.Header = ({ children, className = '', ...props }) => (
  <div className={`card__header ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Body - Main content area
 */
Card.Body = ({ children, className = '', ...props }) => (
  <div className={`card__body ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Footer - Bottom section with optional border
 */
Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`card__footer ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Title - Semantic heading
 */
Card.Title = ({ children, className = '', as: Component = 'h3', ...props }) => (
  <Component className={`card__title ${className}`} {...props}>
    {children}
  </Component>
);

/**
 * Card Description - Secondary text
 */
Card.Description = ({ children, className = '', ...props }) => (
  <p className={`card__description ${className}`} {...props}>
    {children}
  </p>
);

/* ============================================
   SPECIALIZED CARD COMPONENTS
============================================ */

/**
 * Metric Card - For displaying statistics
 */
Card.Metric = ({ value, label, change, changeType = 'neutral', className = '', ...props }) => (
  <div className={`card card--metric ${className}`} {...props}>
    <p className="card__metric-value">{value}</p>
    <p className="card__metric-label">{label}</p>
    {change && (
      <span className={`card__metric-change card__metric-change--${changeType}`}>
        {changeType === 'positive' && '↑ '}
        {changeType === 'negative' && '↓ '}
        {change}
      </span>
    )}
  </div>
);

/**
 * Feature Card - For showcasing features/services
 */
Card.Feature = ({ icon, title, description, onClick, className = '', ...props }) => (
  <div 
    className={`card card--feature ${onClick ? 'card--clickable' : ''} ${className}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    {...props}
  >
    {icon && <div className="card__feature-icon">{icon}</div>}
    {title && <h3 className="card__feature-title">{title}</h3>}
    {description && <p className="card__feature-description">{description}</p>}
  </div>
);

/**
 * List Item - For list cards
 */
Card.ListItem = ({ children, clickable = false, className = '', onClick, ...props }) => (
  <div
    className={`card__list-item ${clickable ? 'card__list-item--clickable' : ''} ${className}`}
    onClick={onClick}
    role={clickable ? 'button' : undefined}
    tabIndex={clickable ? 0 : undefined}
    {...props}
  >
    {children}
  </div>
);

export default Card;
