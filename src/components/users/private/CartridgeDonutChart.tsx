
import React from 'react';

interface CartridgeDonutChartProps {
  percentage: number;
}

export const CartridgeDonutChart: React.FC<CartridgeDonutChartProps> = ({ percentage }) => {
  // Calculate remaining percentage (what's left in the cartridge)
  const remainingPercentage = 100 - percentage;
  
  // Calculate stroke dash arrays for the donut segments
  const circumference = 2 * Math.PI * 20; // Increased radius to make chart bigger
  const usedStrokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
  const remainingStrokeDasharray = `${(remainingPercentage * circumference) / 100} ${circumference}`;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 50 50">
        {/* Dark background circle */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="transparent"
          stroke="#333"
          strokeWidth="5"
        />
        
        {/* Red portion (used percentage) */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="transparent"
          stroke="#ea384c"
          strokeWidth="5"
          strokeDasharray={usedStrokeDasharray}
          strokeDashoffset="0"
          transform="rotate(-90 25 25)"
        />
        
        {/* Blue portion (remaining percentage) */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="transparent"
          stroke="#1EAEDB"
          strokeWidth="5"
          strokeDasharray={remainingStrokeDasharray}
          strokeDashoffset={(percentage * circumference) / 100}
          transform="rotate(-90 25 25)"
        />
        
        {/* Center text displaying remaining percentage */}
        <text
          x="25"
          y="25"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#fff"
        >
          {remainingPercentage}%
        </text>
        
        {/* Optional inner circle for better visual effect */}
        <circle
          cx="25"
          cy="25"
          r="15"
          fill="#121212"
          stroke="none"
        />
      </svg>
    </div>
  );
};
