
// Measurement type definition
export interface Measurement {
  id?: string;
  timestamp: string | any; // Support both string and Firebase timestamp
  volume: number;
  temperature: number;
  cumulative_volume?: number;
  uvc_hours?: number;
  raw_timestamp?: any;
}
