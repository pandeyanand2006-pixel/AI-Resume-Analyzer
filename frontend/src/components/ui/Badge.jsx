import React from 'react';
import './Badge.css';

/**
 * Badge Component - Small status indicators
 * 
 * Variants: primary, secondary, success, warning, error, info
 * Sizes: sm, md
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const classNames = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames} {...props}>
      {children}
    </span>
  );
};

export default Badge;
