import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface AlertDateFieldProps {
  label: string;
  date: string | null;
}

export function AlertDateField({ label, date }: AlertDateFieldProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "Not specified";
    return format(new Date(date), "PPP");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">{label}</label>
      <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="text-white">{formatDate(date)}</span>
      </div>
    </div>
  );
}