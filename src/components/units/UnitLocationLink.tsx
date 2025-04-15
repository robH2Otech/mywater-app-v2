
import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface UnitLocationLinkProps {
  unitId: string;
  iccid?: string;
}

export function UnitLocationLink({ unitId, iccid }: UnitLocationLinkProps) {
  if (!iccid) {
    return null;
  }
  
  return (
    <Link to={`/locations/${iccid}`}>
      <Button 
        variant="outline" 
        className="text-spotify-accent border-spotify-accent hover:bg-spotify-accent/10"
        size="sm"
      >
        <MapPin className="h-4 w-4 mr-2" />
        View Location
      </Button>
    </Link>
  );
}
