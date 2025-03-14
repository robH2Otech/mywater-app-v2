
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface UnitDetailsHeaderProps {
  title: string;
  isSyncing: boolean;
  onSync: () => void;
  onBack: () => void;
}

export const UnitDetailsHeader = ({ 
  title, 
  isSyncing, 
  onSync, 
  onBack 
}: UnitDetailsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <div className="flex gap-2">
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
