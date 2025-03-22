
import React from 'react';

interface CartridgeDonutChartProps {
  percentage: number;
}

export const CartridgeDonutChart: React.FC<CartridgeDonutChartProps> = ({ percentage }) => {
  // Calculate remaining percentage
  const remainingPercentage = 100 - percentage;
  
  // Calculate stroke dash arrays for the donut segments
  const circumference = 2 * Math.PI * 15; // radius is 15
  const usedStrokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
  const remainingStrokeDasharray = `${(remainingPercentage * circumference) / 100} ${circumference}`;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="15"
          fill="transparent"
          stroke="#333"
          strokeWidth="4"
        />
        
        {/* Used percentage - Red */}
        <circle
          cx="20"
          cy="20"
          r="15"
          fill="transparent"
          stroke="#ea384c"
          strokeWidth="4"
          strokeDasharray={usedStrokeDasharray}
          strokeDashoffset="0"
          transform="rotate(-90 20 20)"
        />
        
        {/* Remaining percentage - MyWater Blue */}
        <circle
          cx="20"
          cy="20"
          r="15"
          fill="transparent"
          stroke="#1EAEDB"
          strokeWidth="4"
          strokeDasharray={remainingStrokeDasharray}
          strokeDashoffset={(percentage * circumference) / 100}
          transform="rotate(-90 20 20)"
        />
        
        {/* Percentage Text */}
        <text
          x="20"
          y="20"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#fff"
        >
          {remainingPercentage}%
        </text>
      </svg>
    </div>
  );
};
