import React from 'react';
import './CircularProgress.css';

/**
 * CircularProgress - Enhancv-style circular score gauge
 * Shows score out of 100 with animated SVG circle
 */
function CircularProgress({ 
  score = 0, 
  size = 'md',
  showLabel = true,
  label = '',
  color = 'primary'
}) {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));
  
  // Size configurations
  const sizes = {
    sm: { dimension: 80, strokeWidth: 6, fontSize: 'text-lg' },
    md: { dimension: 120, strokeWidth: 8, fontSize: 'text-3xl' },
    lg: { dimension: 160, strokeWidth: 10, fontSize: 'text-4xl' },
    xl: { dimension: 200, strokeWidth: 12, fontSize: 'text-5xl' }
  };

  const config = sizes[size] || sizes.md;
  const { dimension, strokeWidth } = config;
  
  // Circle calculations
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  // Color variants
  const colorClasses = {
    primary: 'circular-progress--primary',
    success: 'circular-progress--success',
    warning: 'circular-progress--warning',
    error: 'circular-progress--error'
  };

  // Auto color based on score
  const getAutoColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const activeColor = color === 'auto' ? getAutoColor(clampedScore) : color;

  return (
    <div className={`circular-progress circular-progress--${size} ${colorClasses[activeColor]}`}>
      <svg
        className="circular-progress__svg"
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
      >
        {/* Background circle */}
        <circle
          className="circular-progress__bg"
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          className="circular-progress__bar"
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
        />
      </svg>

      {/* Score text overlay */}
      <div className="circular-progress__content">
        <div className={`circular-progress__score ${config.fontSize}`}>
          {Math.round(clampedScore)}
        </div>
        <div className="circular-progress__max">/100</div>
      </div>

      {/* Optional label below */}
      {showLabel && label && (
        <div className="circular-progress__label">{label}</div>
      )}
    </div>
  );
}

export default CircularProgress;
