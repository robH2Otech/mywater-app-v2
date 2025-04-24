
import React from 'react';

export interface WaterUsageTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const WaterUsageTooltip = ({ active, payload, label }: WaterUsageTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0].payload;
  const volume = dataPoint.volume;
  const units = dataPoint.unitIds || [];
  
  let volumeDisplay;
  if (volume < 0.01) {
    volumeDisplay = volume.toFixed(4);
  } else if (volume < 0.1) {
    volumeDisplay = volume.toFixed(3);
  } else if (volume < 1) {
    volumeDisplay = volume.toFixed(2);
  } else {
    volumeDisplay = volume.toFixed(1);
  }
  
  return (
    <div className="bg-gray-800 p-3 rounded shadow border border-gray-700 text-white text-sm">
      <p className="font-medium">Hour: {label}</p>
      <p className="text-blue-300">
        {units.length ? units.join(', ') : 'No unit data'}: {volumeDisplay} m³
      </p>
      {units.length > 1 && (
        <p className="text-xs text-gray-400 mt-1">Multiple units contributing to this value</p>
      )}
    </div>
  );
};
