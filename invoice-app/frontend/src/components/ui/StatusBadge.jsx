import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    PAID: "bg-green-100 text-green-800",
    UNPAID: "bg-red-100 text-red-800",
    PENDING: "bg-yellow-100 text-yellow-800"
  };

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
