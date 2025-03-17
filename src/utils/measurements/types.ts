
// Measurement type definition
export interface Measurement {
  timestamp: string;
  raw_timestamp?: any; // Optional raw_timestamp field
  volume: number;
  temperature: number;
  uvc_hours?: number;
  cumulative_volume?: number; // Add the missing cumulative_volume property
}
