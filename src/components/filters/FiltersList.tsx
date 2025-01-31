import { Card, CardContent } from "@/components/ui/card";
import { Filter, Calendar, AlertTriangle, CheckCircle2, Clock, MapPin } from "lucide-react";

interface FiltersListProps {
  units: any[];
  onFilterClick: (filter: any) => void;
}

export function FiltersList({ units, onFilterClick }: FiltersListProps) {
  const getMaintenanceStatus = (unit: any) => {
    const now = new Date();
    const nextMaintenance = unit.next_maintenance ? new Date(unit.next_maintenance) : null;
    
    if (!nextMaintenance) return "unknown";
    if (nextMaintenance < now) return "overdue";
    
    const daysUntil = Math.ceil((nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) return "soon";
    return "ok";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "overdue":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "soon":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "ok":
        return <CheckCircle2 className="h-5 w-5 text-spotify-green" />;
      default:
        return <Filter className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "overdue":
        return "Overdue";
      case "soon":
        return "Due Soon";
      case "ok":
        return "Active";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {units.map((unit) => {
        const status = getMaintenanceStatus(unit);
        
        return (
          <Card 
            key={unit.id} 
            className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors cursor-pointer"
            onClick={() => onFilterClick(unit)}
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
                    {getStatusIcon(status)}
                    <span className="text-sm font-medium">
                      {getStatusText(status)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {unit.last_maintenance && (
                    <p className="text-sm text-gray-400">
                      Last Maintenance: {new Date(unit.last_maintenance).toLocaleDateString()}
                    </p>
                  )}
                  {unit.next_maintenance && (
                    <p className="text-sm text-gray-400">
                      Next Maintenance: {new Date(unit.next_maintenance).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}