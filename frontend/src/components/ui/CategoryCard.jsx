import React from 'react';
import './CategoryCard.css';

/**
 * CategoryCard - Enhancv-style category cards with icon circles
 * Used for feature sections, checklist items, skill categories
 */
function CategoryCard({ 
  icon,
  title, 
  description,
  items = [],
  variant = 'default',
  onClick
}) {
  const isClickable = !!onClick;

  return (
    <div 
      className={`category-card category-card--${variant} ${isClickable ? 'category-card--clickable' : ''}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Icon Circle */}
      {icon && (
        <div className="category-card__icon-circle">
          {typeof icon === 'string' ? (
            <span className="category-card__icon-emoji">{icon}</span>
          ) : (
            <div className="category-card__icon-svg">{icon}</div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="category-card__content">
        {title && (
          <h3 className="category-card__title">{title}</h3>
        )}
        
        {description && (
          <p className="category-card__description">{description}</p>
        )}

        {/* Checklist Items */}
        {items.length > 0 && (
          <ul className="category-card__checklist">
            {items.map((item, index) => (
              <li key={index} className="category-card__checklist-item">
                <svg 
                  className="category-card__checkmark" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CategoryCard;
