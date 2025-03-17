
// Measurement type definition
export interface Measurement {
  timestamp: string;
  raw_timestamp?: any; // Add raw_timestamp as an optional field
  volume: number;
  temperature: number;
  uvc_hours?: number;
  cumulative_volume?: number; // Add cumulative_volume as an optional field
}
