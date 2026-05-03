import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-card p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
