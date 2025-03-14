import { DocumentData } from "firebase/firestore";
import { jsPDF } from "jspdf";

export interface UnitData {
  id: string;
  name?: string;
  location?: string;
  model?: string;
  status?: string;
  uvc_status?: string;
  total_volume?: number;
  current_volume?: number;
  max_volume?: number;
  last_maintenance?: string;
  next_maintenance?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  [key: string]: any;
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
  measurements: any[];
  generated_by: string;
  created_at: string;
  updated_at?: string;
}

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}
