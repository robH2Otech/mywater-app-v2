
import { Button } from "@/components/ui/button";
import { RefreshCw, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface UnitDetailsHeaderProps {
  title: string;
  isSyncing: boolean;
  onSync: () => void;
  onBack: () => void;
  unitId?: string;
  unitIccid?: string;
}

export const UnitDetailsHeader = ({ 
  title, 
  isSyncing, 
  onSync, 
  onBack,
  unitId,
  unitIccid
}: UnitDetailsHeaderProps) => {
  const handleLocationClick = () => {
    if (!unitIccid) {
      toast.error("No ICCID available for this unit");
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <div className="flex flex-wrap gap-2">
        {unitIccid && (
          <Link to={`/units/location/${unitIccid}`} onClick={!unitIccid ? handleLocationClick : undefined}>
            <Button 
              variant="outline"
              className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none flex items-center gap-2"
              disabled={!unitIccid}
            >
              <MapPin className="h-4 w-4" />
              View Location
            </Button>
          </Link>
        )}
        <Button 
          onClick={onSync}
          variant="outline"
          disabled={isSyncing}
          className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Measurements'}
        </Button>
        <Button 
          onClick={onBack}
          variant="outline"
          className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
        >
          Back to Units
        </Button>
      </div>
    </div>
  );
};
