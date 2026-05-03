import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    PAID:    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    UNPAID:  "bg-red-50 text-red-700 ring-1 ring-red-200",
    PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  };

  const dots = {
    PAID:    "bg-emerald-500",
    UNPAID:  "bg-red-500",
    PENDING: "bg-amber-500",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-gray-400'}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
