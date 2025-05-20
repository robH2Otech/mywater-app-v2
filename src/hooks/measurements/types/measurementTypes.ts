
import { Timestamp } from "firebase/firestore";

export interface RawMeasurement {
  id?: string;
  timestamp: Timestamp | Date | string;
  volume: number;
  temperature?: number;
  uvc_hours?: number;
  cumulative_volume?: number;
  unitId?: string;
  unit_type?: string;
  // Adding properties that are being accessed in dataProcessing.ts
  value?: number;
  temp?: number;
  uvc?: number;
  total_volume?: number | string;
  // Add missing properties
  flow_rate?: number;
  humidity?: number;
}

export interface ProcessedMeasurement {
  id: string;
  timestamp: string;
  rawTimestamp: Timestamp | null;
  volume: number;
  temperature: number;
  uvc_hours: number;
  cumulative_volume: number;
  unitId: string;
}

export type MeasurementPath = string;
