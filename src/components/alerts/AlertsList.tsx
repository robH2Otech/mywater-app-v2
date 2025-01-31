import { Card, CardContent } from "@/components/ui/card";
import { BellRing, AlertTriangle, AlertOctagon } from "lucide-react";

interface AlertsListProps {
  units: any[];
  onAlertClick: (alert: any) => void;
}

export function AlertsList({ units, onAlertClick }: AlertsListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "error":
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <BellRing className="h-5 w-5 text-spotify-green" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-spotify-green";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "error":
        return "Filter change needed soon. Please prepare new filter.";
      case "warning":
        return "Filter life reaching critical level. Plan maintenance.";
      case "limit":
        return "Filter approaching maintenance threshold.";
      default:
        return "System operating normally.";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {units.map((unit) => (
        <Card 
          key={unit.id} 
          className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors cursor-pointer"
          onClick={() => onAlertClick(unit)}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(unit.status)}
                  <h3 className="font-semibold">{unit.name}</h3>
                </div>
                <p className="text-sm text-gray-400">
                  {getStatusMessage(unit.status)}
                </p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">
                    Date: {new Date(unit.updated_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Filter Life: {((unit.total_volume || 0) / 100000 * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}