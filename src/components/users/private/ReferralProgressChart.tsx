
import React from 'react';

interface ReferralProgressChartProps {
  referrals: number;
}

export const ReferralProgressChart: React.FC<ReferralProgressChartProps> = ({ referrals }) => {
  // Ensure referrals is between 0 and 3
  const validReferrals = Math.min(3, Math.max(0, referrals));
  
  // Create an array of 3 referral statuses
  const referralStatuses = Array(3).fill(0).map((_, index) => index < validReferrals);

  return (
    <div className="w-full h-full flex flex-col justify-center gap-1">
      {referralStatuses.map((completed, index) => (
        <div key={index} className="h-3 w-full bg-gray-700 rounded-sm overflow-hidden">
          <div 
            className={`h-full ${completed ? 'bg-mywater-blue' : 'bg-red-500 w-0'}`}
            style={{ width: completed ? '100%' : '0%' }}
          />
        </div>
      ))}
    </div>
  );
};
