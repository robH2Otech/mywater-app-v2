
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateUVCLifePercentage } from "@/utils/uvcStatusUtils";
import { StatusIcon } from "./StatusIcon";
import { Lightbulb, ChevronRight, Edit, RefreshCw, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface UVCCardProps {
  id: string;
  name: string;
  uvc_hours?: number | null;
  uvc_status?: 'active' | 'warning' | 'urgent';
  uvc_installation_date?: string | null;
  latest_measurement_timestamp?: string;
  location?: string;
  onClick?: () => void;
  onEditClick?: (e: React.MouseEvent) => void;
  unit_type?: string;
}

export function UVCCard({ 
  id, 
  name, 
  uvc_hours, 
  uvc_status, 
  uvc_installation_date, 
  latest_measurement_timestamp,
  location, 
  onClick,
  onEditClick,
  unit_type
}: UVCCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate the percentage of UVC life used
  const percentage = calculateUVCLifePercentage(uvc_hours);
  
  // Format UVC hours for display
  const formattedHours = uvc_hours !== undefined && uvc_hours !== null
    ? Math.round(uvc_hours).toLocaleString()
    : '0';
    
  // Format installation date if available
  const formattedDate = uvc_installation_date 
    ? new Date(uvc_installation_date).toLocaleDateString() 
    : 'Not set';
  
  // Format last updated time if available
  const lastUpdated = latest_measurement_timestamp 
    ? formatDistanceToNow(new Date(latest_measurement_timestamp), { addSuffix: true })
    : null;
  
  return (
    <Card 
      className="p-6 bg-spotify-darker hover:bg-spotify-accent/40 transition-colors cursor-pointer relative group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {onEditClick && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onEditClick(e);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {name}
          </h3>
          {location && <p className="text-gray-400 text-sm">{location}</p>}
          {lastUpdated && (
            <p className="text-gray-500 text-xs flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              Updated {lastUpdated}
            </p>
          )}
        </div>
        <StatusIcon status={uvc_status} />
      </div>
      
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">UVC Hours</span>
            <span className="text-white font-semibold">{formattedHours}</span>
          </div>
          <Progress className="h-2.5 mt-1" value={percentage} indicatorClassName={
            percentage < 67 ? "bg-mywater-blue" :
            percentage < 93 ? "bg-yellow-500" :
            "bg-red-500"
          } />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Installation Date</span>
          <span className="text-white">{formattedDate}</span>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        className="w-full flex justify-between items-center p-2 hover:bg-spotify-accent mt-2 border border-gray-700" 
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <span>View Details</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}
