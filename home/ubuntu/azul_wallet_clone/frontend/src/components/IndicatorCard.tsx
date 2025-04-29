import React from 'react';

interface IndicatorCardProps {
  title: string;
  value: string | number; // Allow string or number for flexibility
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      {/* Display value, converting number to string if necessary */}
      <p className="mt-1 text-2xl font-semibold text-gray-900">{typeof value === 'number' ? value.toString() : value}</p>
    </div>
  );
};

export default IndicatorCard;

