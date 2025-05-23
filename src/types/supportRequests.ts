
export interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: Date;
}

export interface SupportRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  support_type: string;
  purifier_model: string;
  status: "new" | "in_progress" | "resolved";
  created_at: Date;
  comments?: Comment[];
  assigned_to?: string;
  company?: string; // Added company field
}

export interface RequestFormData {
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  support_type: string;
  purifier_model: string;
}
