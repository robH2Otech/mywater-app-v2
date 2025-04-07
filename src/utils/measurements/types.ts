
import { Timestamp } from "firebase/firestore";

export interface Measurement {
  timestamp: string; // ISO format timestamp
  raw_timestamp?: any; // Raw firebase timestamp (either server timestamp or ISO string)
  volume: number;
  temperature: number;
  cumulative_volume?: number;
  uvc_hours?: number;
  [key: string]: any; // Allow other fields
}

export interface ProcessedMeasurement {
  id: string;
  timestamp: string; // ISO format timestamp
  rawTimestamp?: any; // Raw firebase timestamp object
  volume: number;
  temperature: number;
  cumulative_volume?: number;
  uvc_hours?: number;
  hourlyVolume?: number;
  [key: string]: any; // Allow other fields
}
