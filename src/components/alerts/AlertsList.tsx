import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellRing, AlertTriangle, AlertOctagon, MapPin, Edit } from "lucide-react";
import { AlertDetailsDialog } from "./AlertDetailsDialog";

interface AlertsListProps {
  units: any[];
  onAlertClick: (alert: any) => void;
}

export function AlertsList({ units, onAlertClick }: AlertsListProps) {
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleEditClick = (e: React.MouseEvent, unit: any) => {
    e.stopPropagation();
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {units.map((unit) => (
          <Card 
            key={unit.id} 
            className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors cursor-pointer relative group"
            onClick={() => onAlertClick(unit)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => handleEditClick(e, unit)}
            >
              <Edit className="h-4 w-4 text-white" />
            </Button>
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
                    {getStatusIcon(unit.status)}
                  </div>
                </div>
                
                <div className="space-y-2 text-left">
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

      <AlertDetailsDialog
        alert={selectedUnit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
