
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface UnitErrorProps {
  error: Error;
  onRetry?: () => void;
  isSyncing?: boolean;
  unitId?: string;
}

export function UnitError({ error, onRetry, isSyncing = false, unitId }: UnitErrorProps) {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-3 md:p-6 max-w-4xl">
      <Card className="bg-spotify-darker border-spotify-accent p-4 md:p-6">
        <div className="text-red-400 p-3 md:p-4">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Error loading unit details</h2>
          <p className="text-sm md:text-base mb-4">{error.message || "An unknown error occurred"}</p>
          
          {unitId && (
            <p className="text-sm text-gray-400 mb-4">
              Unit ID: {unitId} {unitId.startsWith("MYWATER_") ? "(MYWATER unit)" : ""}
            </p>
          )}
          
          <div className="flex flex-wrap gap-3">
            {onRetry && (
              <Button 
                onClick={onRetry} 
                className="bg-spotify-accent hover:bg-spotify-accent-hover flex items-center gap-2"
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? "Refreshing..." : "Retry Loading"}
              </Button>
            )}
            <Button 
              onClick={() => navigate("/units")} 
              variant="outline"
              className="border-spotify-accent text-spotify-accent hover:bg-spotify-accent/10"
            >
              Back to Units
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
