
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

interface UnitLocationHeaderProps {
  displayName: string;
  onBack: () => void;
}

export function UnitLocationHeader({ 
  displayName, 
  onBack 
}: UnitLocationHeaderProps) {
  return (
    <PageHeader 
      title="Unit Location" 
      description={`Location data for unit: ${displayName}`}
      icon={MapPin}
    >
      <Button 
        onClick={onBack} 
        variant="outline"
        className="text-white bg-spotify-accent hover:bg-spotify-accent-hover"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    </PageHeader>
  );
}
