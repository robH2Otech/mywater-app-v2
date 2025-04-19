
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UnitLocationInfoProps {
  displayError: string | null;
  onRetryFetch: () => void;
  onBack: () => void;
  unitId?: string;
}

export function UnitLocationInfo({ 
  displayError, 
  onRetryFetch, 
  onBack,
  unitId
}: UnitLocationInfoProps) {
  return (
    <Card className="bg-spotify-darker border-red-500/20">
      <CardContent className="p-6">
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/30 text-red-200">
          <AlertDescription className="text-red-200">
            {displayError || "Failed to load location data"}
          </AlertDescription>
        </Alert>
        <div className="flex gap-3 mt-4">
          <Button 
            onClick={onRetryFetch}
            className="bg-spotify-accent hover:bg-spotify-accent-hover flex items-center gap-2"
          >
            Retry
          </Button>
          <Button 
            onClick={onBack} 
            variant="outline"
            className="border-spotify-accent text-spotify-accent hover:bg-spotify-accent/10"
          >
            Return to {unitId ? "Unit Details" : "Locations"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
