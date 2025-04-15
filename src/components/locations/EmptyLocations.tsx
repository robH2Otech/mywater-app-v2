
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";

interface EmptyLocationsProps {
  totalUnits: number;
  searchQuery: string;
  onClearSearch: () => void;
}

export function EmptyLocations({ totalUnits, searchQuery, onClearSearch }: EmptyLocationsProps) {
  return (
    <Card className="bg-spotify-darker">
      <CardContent className="p-6 text-center">
        <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">
          {totalUnits === 0 ? "No Units with Location Data" : "No matching units found"}
        </h3>
        <p className="text-gray-400 mb-4">
          {totalUnits === 0 
            ? "There are no units with ICCID identifiers available for location tracking."
            : "Try adjusting your search query to find units."}
        </p>
        {searchQuery && (
          <Button 
            onClick={onClearSearch} 
            variant="ghost" 
            className="bg-spotify-accent hover:bg-spotify-accent-hover text-white"
          >
            Clear Search
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
