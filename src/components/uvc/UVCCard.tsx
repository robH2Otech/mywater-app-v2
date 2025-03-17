
import { Clock, Edit, Lightbulb, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusIcon, getStatusText } from "./StatusIcon";
import { calculateUVCLifePercentage, MAX_UVC_HOURS, WARNING_THRESHOLD, URGENT_THRESHOLD } from "@/utils/uvcStatusUtils";

interface UVCCardProps {
  unit: any;
  onEditClick: (e: React.MouseEvent, unit: any) => void;
  onCardClick: (unit: any) => void;
}

export function UVCCard({ unit, onEditClick, onCardClick }: UVCCardProps) {
  const uvcHours = unit.uvc_hours || 0;
  const lifePercentage = calculateUVCLifePercentage(uvcHours);
  const hoursRemaining = MAX_UVC_HOURS - uvcHours;

  // Format UVC hours with 1 decimal place
  const formatUVCHours = (hours: number) => {
    return hours.toFixed(1);
  };

  return (
    <Card 
      key={unit.id} 
      className={`hover:bg-spotify-accent/40 transition-colors cursor-pointer relative group ${
        unit.uvc_status === 'urgent' ? 'bg-red-900/20' : 
        unit.uvc_status === 'warning' ? 'bg-yellow-900/20' : 
        'bg-spotify-darker'
      }`}
      onClick={() => onCardClick(unit)}
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
              <StatusIcon status={unit.uvc_status} />
              <span className={`text-sm font-medium ${
                unit.uvc_status === 'urgent' ? 'text-red-400' : 
                unit.uvc_status === 'warning' ? 'text-yellow-400' : 
                'text-green-400'
              }`}>
                {getStatusText(unit.uvc_status)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Lightbulb className={`h-4 w-4 ${
                uvcHours >= URGENT_THRESHOLD ? 'text-red-400' :
                uvcHours >= WARNING_THRESHOLD ? 'text-yellow-400' :
                'text-green-400'
              }`} />
              UVC Hours: {formatUVCHours(uvcHours)} / {MAX_UVC_HOURS.toLocaleString()}
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  uvcHours >= URGENT_THRESHOLD ? 'bg-red-500' : 
                  uvcHours >= WARNING_THRESHOLD ? 'bg-yellow-500' : 
                  'bg-spotify-green'
                }`}
                style={{ width: `${lifePercentage}%` }}
              ></div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              {hoursRemaining > 0 
                ? `Hours remaining: ${formatUVCHours(hoursRemaining)}`
                : 'Replacement overdue'
              }
            </div>
            
            {unit.uvc_installation_date && (
              <div className="text-sm text-gray-400">
                Installed: {new Date(unit.uvc_installation_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
