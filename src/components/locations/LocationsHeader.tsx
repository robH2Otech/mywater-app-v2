
import React from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationsHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function LocationsHeader({ onRefresh, isLoading }: LocationsHeaderProps) {
  return (
    <PageHeader 
      title="Units Location" 
      description="View geographic locations of all connected units"
      icon={MapPin}
    >
      <Button 
        onClick={onRefresh} 
        variant="outline" 
        className="bg-spotify-darker text-white hover:bg-spotify-accent"
        disabled={isLoading}
      >
        Refresh Units
      </Button>
    </PageHeader>
  );
}
