
import { DocumentData } from "firebase/firestore";

export interface UnitData {
  id: string;
  name?: string;
  location?: string;
  status?: string;
  volume?: number | string; // The volume from last 24 hours
  total_volume?: number; // Add the missing total_volume property
  last_maintenance?: string;
  next_maintenance?: string;
  setup_date?: string;
  uvc_hours?: number;
  uvc_status?: string;
  uvc_installation_date?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  eid?: string;
  iccid?: string;
}

export interface FilterData {
  id: string;
  unit_id: string;
  installation_date?: string;
  last_change?: string;
  next_change?: string;
  volume_processed?: number;
  contact_name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AlertData {
  id: string;
  unit_id: string;
  message: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReportData {
  id: string;
  unit_id: string;
  report_type: string;
  content: string;
  measurements?: any[];
  generated_by: string;
  created_at: string;
  [key: string]: any;
}

export interface MeasurementData {
  id: string;
  timestamp: string;
  volume: number;
  temperature: number;
  uvc_hours?: number;
}
