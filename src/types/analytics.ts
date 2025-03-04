
import { DocumentData } from "firebase/firestore";

export interface UnitData {
  id: string;
  name?: string;
  location?: string;
  status?: string;
  total_volume?: number;
  last_maintenance?: string;
  next_maintenance?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export interface ReportData {
  id: string;
  unit_id: string;
  report_type: string;
  content: string;
  generated_by: string;
  created_at: string;
  [key: string]: any;
}
