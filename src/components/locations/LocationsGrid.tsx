
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface Unit {
  id: string;
  name: string;
  iccid: string | null;
  site_name?: string;
  customer_name?: string;
}

interface LocationsGridProps {
  units: Unit[];
}

export function LocationsGrid({ units }: LocationsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {units.map((unit) => {
        const hasValidIccid = unit.iccid && unit.iccid.trim().length > 0;
        
        return (
          <Card key={unit.id} className="bg-spotify-darker hover:bg-spotify-dark transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white text-lg">{unit.name}</h3>
                  {unit.site_name && <p className="text-gray-300 text-sm">{unit.site_name}</p>}
                  {unit.customer_name && <p className="text-gray-400 text-xs mt-1">Customer: {unit.customer_name}</p>}
                  {unit.iccid && (
                    <p className="text-gray-400 text-xs mt-1">
                      ICCID: {unit.iccid.length > 16 ? 
                        unit.iccid.substring(0, 6) + '...' + unit.iccid.substring(unit.iccid.length - 6) : 
                        unit.iccid}
                    </p>
                  )}
                  {!hasValidIccid && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      No ICCID available
                    </p>
                  )}
                </div>
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              </div>
              <div className="mt-4 flex justify-end">
                {hasValidIccid ? (
                  <Link to={`/locations/${unit.iccid}`}>
                    <Button variant="outline" className="bg-spotify-accent hover:bg-spotify-accent-hover text-white">
                      View Location
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
                    No Location Data
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
