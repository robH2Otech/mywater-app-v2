
// Measurement type definition
export interface Measurement {
  timestamp: string;
  volume: number;
  temperature: number;
  cumulative_volume: number;
  uvc_hours?: number;
}
