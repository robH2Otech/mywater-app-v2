import { Card, CardContent } from "@/components/ui/card";
import { BellRing, AlertTriangle, AlertOctagon, MapPin } from "lucide-react";

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "error":
        return "Error";
      case "warning":
        return "Warning";
      default:
        return "Active";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {units.map((unit) => (
        <Card 
          key={unit.id} 
          className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors cursor-pointer"
          onClick={() => onAlertClick(unit)}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{unit.name}</h3>
                  {unit.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                      <MapPin className="h-4 w-4" />
                      {unit.location}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(unit.status)}
                  <span className="text-sm font-medium">
                    {getStatusText(unit.status)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Volume: {unit.total_volume ? `${unit.total_volume} m³` : 'N/A'}
                </p>
                <p className="text-sm text-gray-400">
                  Last Maintenance: {unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}