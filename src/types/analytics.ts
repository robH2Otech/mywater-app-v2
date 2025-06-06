
import { DocumentData } from "firebase/firestore";

export interface UnitData {
  id: string;
  name?: string;
  location?: string;
  status?: string;
  total_volume?: number | string;
  last_maintenance?: string;
  next_maintenance?: string;
  setup_date?: string;
  uvc_hours?: number;
  uvc_status?: string;
  uvc_installation_date?: string;
  is_uvc_accumulated?: boolean;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  eid?: string;
  iccid?: string;
  unit_type?: string;
  company?: string; // Added company property
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
  company?: string; // Added company property
}

export interface AlertData {
  id: string;
  unit_id: string;
  message: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  company?: string; // Added company property
}

export interface ReportData {
  id: string;
  unit_id: string;
  report_type: string;
  content: string;
  measurements?: any[];
  generated_by: string;
  created_at: string;
  company?: string; // Added company property
  [key: string]: any;
}

export interface MeasurementData {
  id: string;
  timestamp: string;
  volume: number;
  temperature: number;
  cumulative_volume?: number;
  uvc_hours?: number;
  company?: string; // Added company property
}
