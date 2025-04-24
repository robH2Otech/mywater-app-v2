
import React from "react";
import { TooltipProps } from "recharts";

export interface WaterUsageTooltipProps extends TooltipProps<number, string> {
  // Make the required props from Recharts optional since they'll be passed automatically
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const WaterUsageTooltip: React.FC<WaterUsageTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  
  return (
    <div className="bg-spotify-darker border border-spotify-accent p-3 rounded shadow-lg">
      <p className="text-white font-medium">{`Time: ${label}`}</p>
      <p className="text-blue-300">{`Volume: ${Number(data.volume).toFixed(2)} m³`}</p>
      {data.temperature !== undefined && (
        <p className="text-yellow-300">{`Temperature: ${Number(data.temperature).toFixed(1)}°C`}</p>
      )}
    </div>
  );
};
