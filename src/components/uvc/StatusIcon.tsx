
import { Check, AlertTriangle, AlertOctagon } from "lucide-react";

interface StatusIconProps {
  status: string;
}

export function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case "urgent":
      return <AlertOctagon className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "active":
    default:
      return <Check className="h-5 w-5 text-spotify-green" />;
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case "urgent":
      return "Replace Soon";
    case "warning":
      return "Maintenance Required";
    case "active":
    default:
      return "Active";
  }
}
