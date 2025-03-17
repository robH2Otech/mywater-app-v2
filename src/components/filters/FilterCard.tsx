
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, AlertOctagon, MapPin, Edit, Calendar } from "lucide-react";

interface FilterCardProps {
  unit: any;
  onEditClick: (e: React.MouseEvent, unit: any) => void;
  onClick: () => void;
}

export function FilterCard({ unit, onEditClick, onClick }: FilterCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "urgent":
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "active":
      default:
        return <Check className="h-5 w-5 text-spotify-green" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "urgent":
        return "Urgent Change";
      case "warning":
        return "Attention";
      case "active":
      default:
        return "Active";
    }
  };

  // Enhanced function to format volume with thousands separators and fixed decimal places
  const formatVolume = (volume: number | string | null | undefined) => {
    if (volume === null || volume === undefined) return 'N/A';
    
    try {
      const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
      if (isNaN(numVolume)) return 'N/A';
      return numVolume.toLocaleString(undefined, { maximumFractionDigits: 2 });
    } catch (err) {
      console.error("Error formatting volume:", volume, err);
      return 'N/A';
    }
  };

  return (
    <Card 
      className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors cursor-pointer relative group"
      onClick={onClick}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={(e) => onEditClick(e, unit)}
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
              <span className="text-sm font-medium">
                {getStatusText(unit.status)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-left">
            <div className="text-sm text-gray-400">
              Total Volume: {formatVolume(unit.total_volume)} m³
            </div>
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
}
