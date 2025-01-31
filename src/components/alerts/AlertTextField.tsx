import { LucideIcon } from "lucide-react";

interface AlertTextFieldProps {
  label: string;
  value: string | null;
  icon: LucideIcon;
}

export function AlertTextField({ label, value, icon: Icon }: AlertTextFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">{label}</label>
      <div className="flex items-start gap-2 px-3 py-2 bg-spotify-accent rounded-md">
        <Icon className="h-4 w-4 text-gray-400 mt-1" />
        <span className="text-white">{value || "Not specified"}</span>
      </div>
    </div>
  );
}