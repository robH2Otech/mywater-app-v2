
// Measurement type definition
export interface Measurement {
  timestamp: string;
  raw_timestamp?: any; // Add raw_timestamp as an optional field
  volume: number;
  temperature: number;
  cumulative_volume?: number; // Make cumulative_volume optional
  uvc_hours?: number;
  id?: string; // Add id field that's used in certain contexts
}
