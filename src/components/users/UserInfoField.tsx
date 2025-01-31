import { LucideIcon } from "lucide-react";

interface UserInfoFieldProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export function UserInfoField({ label, value, icon: Icon }: UserInfoFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">{label}</label>
      <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-white">{value}</span>
      </div>
    </div>
  );
}