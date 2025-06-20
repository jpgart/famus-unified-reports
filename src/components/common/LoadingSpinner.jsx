import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'famus-orange' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const colorClasses = {
    'famus-orange': 'border-famus-orange',
    'famus-navy': 'border-famus-navy',
    'famus-blue': 'border-famus-blue',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          border-4 border-solid border-t-transparent rounded-full spinner
        `}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
