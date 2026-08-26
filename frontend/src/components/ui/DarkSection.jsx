import React from 'react';
import './DarkSection.css';

/**
 * DarkSection - Enhancv-style dark background sections
 * Navy/black background with white text
 */
function DarkSection({ 
  children,
  variant = 'dark',
  className = ''
}) {
  return (
    <section className={`dark-section dark-section--${variant} ${className}`}>
      <div className="dark-section__inner">
        {children}
      </div>
    </section>
  );
}

// Sub-components for semantic structure
DarkSection.Header = function DarkSectionHeader({ 
  badge,
  title, 
  description,
  align = 'center'
}) {
  return (
    <div className={`dark-section__header dark-section__header--${align}`}>
      {badge && (
        <div className="dark-section__badge">{badge}</div>
      )}
      {title && (
        <h2 className="dark-section__title">{title}</h2>
      )}
      {description && (
        <p className="dark-section__description">{description}</p>
      )}
    </div>
  );
};

DarkSection.Content = function DarkSectionContent({ children, className = '' }) {
  return (
    <div className={`dark-section__content ${className}`}>
      {children}
    </div>
  );
};

export default DarkSection;
