
import { useCallback } from 'react';

interface ProcessedMeasurement {
  timestamp: Date;
  volume: number;
  unitId: string;
  unit_type: string;
}

export const useMeasurementProcessing = () => {
  const processMeasurement = useCallback((data: any) => {
    let timestamp = data.timestamp;
    if (timestamp && typeof timestamp.toDate === "function") {
      timestamp = timestamp.toDate();
    } else if (typeof timestamp === "string") {
      timestamp = new Date(timestamp);
    }
    
    // Extract volume from various possible fields
    let volume = 0;
    if (typeof data.volume === 'number') {
      volume = data.volume;
    } else if (typeof data.volume === 'string') {
      volume = parseFloat(data.volume) || 0;
    } else if (typeof data.value === 'number') {
      volume = data.value;
    } else if (typeof data.total_volume === 'number') {
      volume = data.total_volume;
    }
    
    return {
      ...data,
      timestamp,
      volume,
      unitId: data.unitId || data.id || 'unknown',
      unit_type: data.unit_type || 'uvc'
    };
  }, []);

  return { processMeasurement };
};
