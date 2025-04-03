
import { Check, AlertTriangle, AlertOctagon, MapPin, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditUnitDialog } from "./EditUnitDialog";

interface UnitCardProps {
  id: string;
  name: string;
  status: string;
  location?: string | null;
  total_volume?: number | string | null;
  last_maintenance?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  next_maintenance?: string | null;
  setup_date?: string | null;
  uvc_hours?: number | string | null;
  uvc_status?: string | null;
  uvc_installation_date?: string | null;
  eid?: string | null;
  iccid?: string | null;
  unit_type?: string | null;
}

export const UnitCard = ({
  id,
  name,
  status,
  location,
  total_volume,
  last_maintenance,
  contact_name,
  contact_email,
  contact_phone,
  next_maintenance,
  setup_date,
  uvc_hours,
  uvc_status,
  uvc_installation_date,
  eid,
  iccid,
  unit_type,
}: UnitCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Only UVC units should have UVC-specific information displayed
  const isUVCUnit = unit_type === 'uvc';
  
  // DROP and Office units are treated as filter units
  const isDropUnit = unit_type === 'drop';
  const isOfficeUnit = unit_type === 'office';
  const isFilterUnit = isDropUnit || isOfficeUnit;

  const getStatusIcon = () => {
    switch (status) {
      case "urgent":
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Check className="h-5 w-5 text-mywater-blue" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "urgent":
        return "Urgent Change";
      case "warning":
        return "Warning";
      default:
        return "Active";
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString();
  };

  const formatVolume = (volume: number | string | null | undefined) => {
    if (volume === null || volume === undefined) return "N/A";
    
    try {
      const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
      if (isNaN(numVolume)) return "N/A";
      return Math.round(numVolume).toLocaleString();
    } catch (err) {
      console.error("Error formatting volume:", volume, err);
      return "N/A";
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setIsEditDialogOpen(true);
  };

  const unitTypeLabel = isOfficeUnit ? 'Office Filter' : 
                        isDropUnit ? 'DROP Filter' : 
                        'UVC Unit';

  return (
    <>
      <Link to={`/units/${id}`} className="block">
        <Card className="p-6 bg-spotify-darker hover:bg-spotify-accent/40 transition-colors relative group">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4 text-white" />
          </Button>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">{name}</h3>
              {location && <p className="text-gray-400 text-sm">{location}</p>}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`text-sm font-medium capitalize ${
                status === 'urgent' ? 'text-red-400' : 
                status === 'warning' ? 'text-yellow-400' : 
                'text-mywater-blue'
              }`}>
                {getStatusText(status)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              Volume: {formatVolume(total_volume)} m³
            </p>
            <p className="text-sm text-gray-400">
              Last Maintenance: {formatDate(last_maintenance)}
            </p>
            {unit_type && (
              <p className="text-sm text-gray-400">
                Type: {unitTypeLabel}
              </p>
            )}
            {isUVCUnit && uvc_hours && (
              <p className="text-sm text-gray-400">
                UVC Hours: {formatVolume(uvc_hours)}
              </p>
            )}
          </div>
        </Card>
      </Link>

      <EditUnitDialog
        unit={{
          id,
          name,
          status,
          location,
          total_volume,
          contact_name,
          contact_email,
          contact_phone,
          next_maintenance,
          setup_date,
          uvc_hours,
          uvc_status,
          uvc_installation_date,
          eid,
          iccid,
          unit_type,
        }}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
};
