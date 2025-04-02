
export interface UnitFormData {
  name: string;
  location: string;
  total_volume: string;
  status: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  next_maintenance: Date | null;
  setup_date: Date | null;
  uvc_hours: string;
  eid: string;
  iccid: string;
  unit_type: string;
}

export interface UnitData {
  id: string;
  name: string;
  location?: string | null;
  total_volume?: number | string | null;
  status: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  next_maintenance?: string | null;
  setup_date?: string | null;
  uvc_hours?: number | string | null;
  uvc_status?: string | null;
  uvc_installation_date?: string | null;
  eid?: string | null;
  iccid?: string | null;
  unit_type?: string | null;
  created_at?: string;
  updated_at?: string;
}
