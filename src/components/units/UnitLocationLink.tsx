
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface UnitLocationLinkProps {
  unitId: string;
  iccid?: string | null;
}

export function UnitLocationLink({ unitId, iccid }: UnitLocationLinkProps) {
  if (!iccid) {
    return null;
  }
  
  // Clean ICCID for the URL
  const cleanIccid = iccid.replace(/\s+/g, '').trim();
  
  const handleClick = () => {
    // For analytics or debug purposes
    console.log(`Navigating to location for Unit ID: ${unitId}, ICCID: ${cleanIccid}`);
  };
  
  return (
    <Link to={`/locations/${cleanIccid}`} onClick={handleClick}>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2 border-spotify-accent text-spotify-accent hover:bg-spotify-accent/10"
      >
        <MapPin className="h-4 w-4" />
        View Location
      </Button>
    </Link>
  );
}
