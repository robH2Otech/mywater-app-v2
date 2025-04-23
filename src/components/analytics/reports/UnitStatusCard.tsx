import { Card } from "@/components/ui/card";
import { UnitData } from "@/types/analytics";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnitStatusCardProps {
  unit: UnitData;
}

export function UnitStatusCard({ unit }: UnitStatusCardProps) {
  const isMobile = useIsMobile();
  
  // Format volume with whole numbers and correct units
  const formatVolume = (volume: number | string | undefined | null) => {
    if (volume === undefined || volume === null) return "0";
    const numericVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
    if (isNaN(numericVolume)) return "0";
    
    // Use m³ for UVC units, L for other types
    const isFilterUnit = unit.unit_type === 'drop' || unit.unit_type === 'office';
    const volumeUnit = isFilterUnit ? 'L' : 'm³';
    
    return `${Math.round(numericVolume)} ${volumeUnit}`;
  };
  
  // Format UVC hours with whole numbers
  const formatUVCHours = (hours: number | string | undefined | null) => {
    if (hours === undefined || hours === null) return "0";
    const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    if (isNaN(numericHours)) return "0";
    return Math.round(numericHours).toString();
  };
  
  return (
    <Card className="p-4 bg-spotify-darker border-spotify-accent">
      <h3 className="text-lg font-semibold mb-4">Unit Status</h3>
      <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"}`}>
        <div>
          <p className="text-gray-400 text-sm">Unit Status</p>
          <p className={`text-lg font-medium ${
            unit.status === 'active' ? 'text-mywater-blue' :
            unit.status === 'warning' ? 'text-yellow-400' :
            unit.status === 'urgent' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {unit.status || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">UVC Status</p>
          <p className={`text-lg font-medium ${
            unit.uvc_status === 'active' ? 'text-mywater-blue' :
            unit.uvc_status === 'warning' ? 'text-yellow-400' :
            unit.uvc_status === 'urgent' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {unit.uvc_status || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Volume</p>
          <p className="text-lg font-medium">{formatVolume(unit.total_volume)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">UVC Hours</p>
          <p className="text-lg font-medium">{formatUVCHours(unit.uvc_hours)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Last Maintenance</p>
          <p className="text-sm">
            {unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Next Maintenance</p>
          <p className="text-sm">
            {unit.next_maintenance ? new Date(unit.next_maintenance).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    </Card>
  );
}
