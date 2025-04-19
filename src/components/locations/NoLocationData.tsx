
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NoLocationDataProps {
  onBack: () => void;
  unitId?: string;
}

export function NoLocationData({ onBack, unitId }: NoLocationDataProps) {
  return (
    <Card className="bg-spotify-darker border-yellow-500/20">
      <CardContent className="p-6">
        <p className="text-yellow-300">No location data available for this unit.</p>
        <Button 
          onClick={onBack} 
          className="mt-4 bg-spotify-accent hover:bg-spotify-accent-hover"
        >
          Return to {unitId ? "Unit Details" : "Locations"}
        </Button>
      </CardContent>
    </Card>
  );
}
