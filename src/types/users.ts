
export interface AppUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

// Export User as an alias to AppUser for backward compatibility
export type User = AppUser;

export type UserRole = "superadmin" | "admin" | "technician" | "user";
export type UserStatus = "active" | "inactive" | "pending";

export interface UserCompanyAccess {
  id: string;
  user_id: string;
  company: string;
  created_at: string;
}
