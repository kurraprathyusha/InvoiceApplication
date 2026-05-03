import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          ${error ? 'border-danger bg-red-50/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
