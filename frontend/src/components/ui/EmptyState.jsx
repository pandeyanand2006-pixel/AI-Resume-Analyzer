import React from 'react';
import Button from './Button.jsx';
import './EmptyState.css';

/**
 * EmptyState Component - ResumeAI Design System
 * Professional empty state displays for all scenarios
 * 
 * @param {ReactNode|string} icon - Icon (emoji, SVG, or component)
 * @param {string} title - Primary heading
 * @param {string} description - Supporting text
 * @param {object} action - Primary action { label, onClick, variant }
 * @param {object} secondaryAction - Secondary action { label, onClick, variant }
 * @param {string} size - small | default | large | compact
 * @param {string} variant - default | info | success | error | warning | illustration
 * @param {string} className - Additional CSS classes
 */
function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  secondaryAction,
  className = '',
  size = 'default',
  variant = 'default',
  illustration
}) {
  const classNames = [
    'empty-state',
    `empty-state--${size}`,
    variant !== 'default' && `empty-state--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="status" aria-live="polite">
      <div className="empty-state__content">
        {(icon || illustration) && (
          <div className="empty-state__icon" aria-hidden="true">
            {illustration ? (
              typeof illustration === 'string' ? (
                <img src={illustration} alt="" />
              ) : (
                illustration
              )
            ) : (
              typeof icon === 'string' ? icon : icon
            )}
          </div>
        )}
        
        {title && (
          <h3 className="empty-state__title">{title}</h3>
        )}
        
        {description && (
          <p className="empty-state__description">{description}</p>
        )}
        
        {(action || secondaryAction) && (
          <div className="empty-state__actions">
            {action && (
              <Button 
                onClick={action.onClick}
                variant={action.variant || 'primary'}
                size={size === 'small' || size === 'compact' ? 'sm' : 'md'}
                icon={action.icon}
              >
                {action.label}
              </Button>
            )}
            
            {secondaryAction && (
              <Button 
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || 'ghost'}
                size={size === 'small' || size === 'compact' ? 'sm' : 'md'}
                icon={secondaryAction.icon}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================
   PRESET EMPTY STATES - Common Scenarios
============================================ */

/**
 * No Data - Generic empty state for resources
 */
EmptyState.NoData = ({ resource = 'items', action, className = '' }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    }
    title={`No ${resource} yet`}
    description={`You haven't created any ${resource} yet. Get started by creating your first one.`}
    action={action}
    variant="info"
    className={className}
  />
);

/**
 * No Results - Search/filter yielded no results
 */
EmptyState.NoResults = ({ query, onClear, className = '' }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    }
    title="No results found"
    description={
      query 
        ? `No results match "${query}". Try adjusting your search or filters.`
        : 'Try adjusting your search criteria or filters.'
    }
    action={onClear ? { label: 'Clear Filters', onClick: onClear, variant: 'outline' } : null}
    className={className}
    size="small"
  />
);

/**
 * Error - Something went wrong
 */
EmptyState.Error = ({ message, onRetry, className = '' }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    }
    title="Something went wrong"
    description={message || 'An error occurred while loading data. Please try again.'}
    action={onRetry ? { label: 'Try Again', onClick: onRetry } : null}
    variant="error"
    className={className}
  />
);

/**
 * No Permission - Access denied
 */
EmptyState.NoPermission = ({ resource = 'this content', className = '' }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    }
    title="Access Denied"
    description={`You don't have permission to view ${resource}. Contact your administrator if you believe this is an error.`}
    variant="warning"
    className={className}
  />
);

/**
 * Coming Soon - Feature not yet available
 */
EmptyState.ComingSoon = ({ feature = 'This feature', className = '' }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
      </svg>
    }
    title="Coming Soon"
    description={`${feature} is currently under development and will be available soon. Stay tuned for updates!`}
    variant="info"
    className={className}
  />
);

/**
 * No Resumes - Specific to resume management
 */
EmptyState.NoResumes = ({ onCreate, className = '' }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    }
    title="No resumes yet"
    description="Create your first AI-powered resume and unlock your career potential. Get started in minutes with our intelligent resume builder."
    action={onCreate ? { label: 'Create Resume', onClick: onCreate, variant: 'primary' } : null}
    variant="info"
    className={className}
  />
);

/**
 * No Jobs - Specific to job search
 */
EmptyState.NoJobs = ({ onSearch, className = '' }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    }
    title="No jobs available"
    description="We couldn't find any jobs matching your criteria. Try adjusting your filters or check back later for new opportunities."
    action={onSearch ? { label: 'Search Jobs', onClick: onSearch, variant: 'primary' } : null}
    className={className}
  />
);

/**
 * Success - Operation completed successfully
 */
EmptyState.Success = ({ title = 'Success!', description, action, className = '' }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    }
    title={title}
    description={description || 'Your action has been completed successfully.'}
    action={action}
    variant="success"
    size="small"
    className={className}
  />
);

/**
 * Maintenance - System under maintenance
 */
EmptyState.Maintenance = ({ message, className = '' }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    }
    title="Under Maintenance"
    description={message || "We're performing scheduled maintenance. Please check back shortly."}
    variant="warning"
    className={className}
  />
);

/**
 * Offline - No network connection
 */
EmptyState.Offline = ({ onRetry, className = '' }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
        <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0122.58 9" />
        <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
        <path d="M8.53 16.11a6 6 0 016.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    }
    title="No Connection"
    description="Unable to connect to the internet. Please check your connection and try again."
    action={onRetry ? { label: 'Retry', onClick: onRetry } : null}
    variant="error"
    size="small"
    className={className}
  />
);

export default EmptyState;
