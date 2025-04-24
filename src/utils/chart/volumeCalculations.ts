
export const detectCumulativeData = (measurements: any[]): boolean => {
  // Check if data appears to be cumulative by looking at first few points
  for (let i = 1; i < Math.min(measurements.length, 5); i++) {
    if (measurements[i].volume < measurements[i-1].volume) {
      return false;
    }
  }
  return true;
};

export const calculateVolumeDelta = (
  current: number,
  previous: number,
  maxReasonableDelta = 50 // Max reasonable volume change in m³ per hour
): number => {
  const delta = current - previous;
  if (delta <= 0) return 0;
  return Math.min(delta, maxReasonableDelta);
};

export const convertToM3 = (volume: number, unitType: string): number => {
  const isLiterUnit = unitType === 'drop' || unitType === 'office';
  return isLiterUnit ? volume / 1000 : volume;
};
