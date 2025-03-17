
// Measurement type definition
export interface Measurement {
  timestamp: string;
  raw_timestamp?: any; // Add raw_timestamp as an optional field
  volume: number;
  temperature: number;
  uvc_hours?: number;
}
