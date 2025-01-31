import { AlertTriangle } from "lucide-react";

interface AlertStatusFieldProps {
  status: string;
}

export function AlertStatusField({ status }: AlertStatusFieldProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-spotify-green';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Status</label>
      <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
        <AlertTriangle className={`h-4 w-4 ${getStatusColor(status)}`} />
        <span className={`${getStatusColor(status)} capitalize`}>{status}</span>
      </div>
    </div>
  );
}