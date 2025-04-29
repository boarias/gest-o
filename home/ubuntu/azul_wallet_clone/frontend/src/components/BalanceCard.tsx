import React from 'react';
// import { Edit2 } from 'lucide-react'; // Using Lucide icon for edit - Removed as unused

interface BalanceCardProps {
  titular: string;
  saldo: string; // Formatted currency string
}

const BalanceCard: React.FC<BalanceCardProps> = ({ titular, saldo }) => {
  // Determine text color based on saldo value (negative = red, positive/zero = green)
  // Assuming saldo is already formatted as 'R$ -1.234,56' or 'R$ 1.234,56'
  const isNegative = saldo.includes('-');
  const textColor = isNegative ? 'text-red-600' : 'text-green-600';

  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-medium text-gray-500 truncate">{titular}</h4>
        <p className={`mt-1 text-xl font-semibold ${textColor}`}>{saldo}</p>
      </div>
      {/* Optional: Add an edit icon/button if needed in the future */}
      {/* <button className="text-gray-400 hover:text-blue-600 self-end mt-2">
        <Edit2 size={16} />
      </button> */}
    </div>
  );
};

export default BalanceCard;

