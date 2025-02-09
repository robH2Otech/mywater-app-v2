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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-white">{unit.name}</h3>
                    {unit.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                        <MapPin className="h-4 w-4" />
                        {unit.location}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                  </div>
                </div>
                
                <div className="space-y-2 text-left">
                  {unit.last_maintenance && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      Last: {new Date(unit.last_maintenance).toLocaleDateString()}
                    </div>
                  )}
                  {unit.next_maintenance && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      Next: {new Date(unit.next_maintenance).toLocaleDateString()}
                    </div>
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