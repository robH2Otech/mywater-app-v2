
import { Card } from "@/components/ui/card";
import { UnitData } from "@/types/analytics";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnitStatusCardProps {
  unit: UnitData;
}

export function UnitStatusCard({ unit }: UnitStatusCardProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card className="p-4 bg-spotify-darker border-spotify-accent">
      <h3 className="text-lg font-semibold mb-4">Unit Status</h3>
      <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"}`}>
        <div>
          <p className="text-gray-400 text-sm">Unit Status</p>
          <p className={`text-lg font-medium ${
            unit.status === 'active' ? 'text-green-400' :
            unit.status === 'warning' ? 'text-yellow-400' :
            unit.status === 'urgent' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {unit.status || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">UVC Status</p>
          <p className={`text-lg font-medium ${
            unit.uvc_status === 'active' ? 'text-green-400' :
            unit.uvc_status === 'warning' ? 'text-yellow-400' :
            unit.uvc_status === 'urgent' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {unit.uvc_status || 'N/A'}
          </p>
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
