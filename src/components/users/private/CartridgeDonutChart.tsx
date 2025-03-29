
import React from 'react';

interface CartridgeDonutChartProps {
  percentage: number;
}

export const CartridgeDonutChart: React.FC<CartridgeDonutChartProps> = ({ percentage }) => {
  // Calculate remaining percentage (what's left in the cartridge)
  const remainingPercentage = Math.max(0, Math.min(100 - percentage, 100));
  
  // Determine colors based on percentage
  const getColor = () => {
    if (percentage >= 80) return "#ea384c"; // Red for high usage
    if (percentage >= 50) return "#f97316"; // Orange for medium usage
    return "#1EAEDB"; // Blue for low usage
  };
  
  // Calculate stroke dash arrays for the donut segments
  const circumference = 2 * Math.PI * 20; // Circle circumference
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
        
        {/* Used portion with dynamic color */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="transparent"
          stroke={getColor()}
          strokeWidth="5"
          strokeDasharray={usedStrokeDasharray}
          strokeDashoffset="0"
          transform="rotate(-90 25 25)"
        />
        
        {/* Remaining portion (blue) */}
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
          fontSize="10"
          fontWeight="bold"
          fill="#fff"
        >
          {remainingPercentage.toFixed(0)}%
        </text>
        
        <text
          x="25"
          y="32"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="6"
          fill="#aaa"
        >
          remaining
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
