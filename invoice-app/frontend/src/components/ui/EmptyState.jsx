import React from 'react';

const EmptyState = ({ message, actionText, onAction, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg shadow-sm border border-gray-200">
      {Icon && <Icon className="w-12 h-12 text-gray-400 mb-4" />}
      <p className="text-gray-500 mb-4">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="text-primary font-medium hover:text-primary-dark"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
