
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info } from "lucide-react";
import { LocationData } from "@/utils/locations/locationData";
import { UnitLocationMap } from "@/components/units/UnitLocationMap";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UnitLocationDisplayProps {
  locationData: LocationData;
  onRefresh: () => void;
  isLoading: boolean;
}

export function UnitLocationDisplay({ 
  locationData, 
  onRefresh, 
  isLoading 
}: UnitLocationDisplayProps) {
  // Parse timestamp and format it
  const timestamp = locationData.timestamp ? new Date(locationData.timestamp) : null;
  const isValidDate = timestamp && isValid(timestamp);
  const formattedDate = isValidDate 
    ? format(timestamp, "MMM d, yyyy 'at' h:mm a") 
    : "Unknown";
  
  const timeAgo = isValidDate
    ? formatDistanceToNow(timestamp, { addSuffix: true })
    : "";

  return (
    <div className="space-y-6">
      <Card className="bg-spotify-darker">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-spotify-accent/20 border border-spotify-accent/20">
              <h3 className="text-sm font-medium text-gray-400">Latitude</h3>
              <p className="text-xl font-bold text-white mt-1">{locationData.latitude.toFixed(6)}</p>
            </div>
            
            <div className="p-4 rounded-lg bg-spotify-accent/20 border border-spotify-accent/20">
              <h3 className="text-sm font-medium text-gray-400">Longitude</h3>
              <p className="text-xl font-bold text-white mt-1">{locationData.longitude.toFixed(6)}</p>
            </div>
            
            <div className="p-4 rounded-lg bg-spotify-accent/20 border border-spotify-accent/20">
              <h3 className="text-sm font-medium text-gray-400">Accuracy Radius</h3>
              <p className="text-xl font-bold text-white mt-1">{locationData.radius} meters</p>
            </div>
          </div>
          
          {locationData.lastCountry && locationData.lastOperator && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-lg bg-spotify-accent/10 border border-spotify-accent/10">
                <h3 className="text-sm font-medium text-gray-400">Country</h3>
                <p className="text-md font-medium text-white mt-1">{locationData.lastCountry}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-spotify-accent/10 border border-spotify-accent/10">
                <h3 className="text-sm font-medium text-gray-400">Network Operator</h3>
                <p className="text-md font-medium text-white mt-1">{locationData.lastOperator}</p>
              </div>
            </div>
          )}
          
          <div className="bg-spotify-dark/40 p-4 rounded-md border border-spotify-accent/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-300 flex items-center">
                  <span className="font-medium">Last Updated:</span> 
                  <span className="ml-2">{formattedDate}</span>
                  {timeAgo && <span className="text-xs text-gray-400 ml-2">({timeAgo})</span>}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Location data is updated twice daily at 6 AM and 6 PM UTC
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Info className="h-4 w-4 text-spotify-accent" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-spotify-darker text-white border-spotify-accent/30 p-3 max-w-xs">
                    <p>Location data is updated automatically twice daily.</p>
                    <p className="mt-1">Manual updates can be triggered using the Refresh button.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-md">
            <p className="text-sm text-gray-300">
              <strong>Note:</strong> Location is approximate, based on cell tower information.
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={onRefresh}
              variant="outline" 
              className="flex items-center gap-2 border-spotify-accent text-spotify-accent hover:bg-spotify-accent/10"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Location
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="h-[60vh] relative rounded-lg overflow-hidden">
        <UnitLocationMap 
          latitude={locationData.latitude} 
          longitude={locationData.longitude} 
          radius={locationData.radius} 
        />
      </div>
    </div>
  );
}
