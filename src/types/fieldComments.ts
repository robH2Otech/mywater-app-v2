
export interface FieldComment {
  id: string;
  content: string;
  author_name: string;
  author_id: string;
  author_role: string;
  created_at: Date;
  entity_type: "alert" | "filter" | "unit";
  entity_id: string;
  field_verified: boolean;
}
