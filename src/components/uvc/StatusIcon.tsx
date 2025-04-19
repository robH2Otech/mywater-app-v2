
import { Check, AlertTriangle, AlertOctagon } from "lucide-react";

interface StatusIconProps {
  status?: 'active' | 'warning' | 'urgent';
}

export function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case "urgent":
      return <AlertOctagon className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "active":
    default:
      return <Check className="h-5 w-5 text-mywater-blue" />;
  }
}
