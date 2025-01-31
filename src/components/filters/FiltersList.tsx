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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {units.map((unit) => {
        const status = getMaintenanceStatus(unit);
        const statusColors = {
          overdue: "text-red-500",
          soon: "text-yellow-500",
          ok: "text-spotify-green",
          unknown: "text-gray-400",
        };
        
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
                    <h3 className="font-semibold">{unit.name}</h3>
                    {unit.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                        <MapPin className="h-4 w-4" />
                        {unit.location}
                      </div>
                    )}
                  </div>
                  {status === "overdue" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  {status === "soon" && <Clock className="h-5 w-5 text-yellow-500" />}
                  {status === "ok" && <CheckCircle2 className="h-5 w-5 text-spotify-green" />}
                </div>
                
                <div className="space-y-2">
                  {unit.last_maintenance && (
                    <div className="text-sm text-gray-400">
                      Last Maintenance: {new Date(unit.last_maintenance).toLocaleDateString()}
                    </div>
                  )}
                  {unit.next_maintenance && (
                    <div className={`text-sm ${statusColors[status]}`}>
                      Next Maintenance: {new Date(unit.next_maintenance).toLocaleDateString()}
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