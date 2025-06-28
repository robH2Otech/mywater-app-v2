
import React from 'react';
import { Card } from '@/components/ui/card';
import { LocationData } from '@/utils/locations/locationData';
import { formatDistance } from 'date-fns';
import { AlertTriangle, MapPin } from 'lucide-react';

interface UnitLocationDetailsProps {
  locationData: LocationData | null;
  unitName: string;
  iccid: string;
  isLoading: boolean;
}

export const UnitLocationDetails: React.FC<UnitLocationDetailsProps> = ({ 
  locationData, 
  unitName, 
  iccid,
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-400/30 rounded w-1/2"></div>
          <div className="h-4 bg-gray-400/30 rounded w-3/4"></div>
          <div className="h-4 bg-gray-400/30 rounded w-2/3"></div>
          <div className="h-4 bg-gray-400/30 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Location Details
      </h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">Unit Name</p>
          <p className="font-semibold">{unitName || 'Unknown'}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-400">ICCID</p>
          <p className="font-mono text-sm">{iccid !== '---' ? iccid : 'Not provided'}</p>
        </div>
        
        {locationData ? (
          <>
            <div>
              <p className="text-sm text-gray-400">Country</p>
              <p>{locationData.lastCountry || 'Unknown'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Operator</p>
              <p>{locationData.lastOperator || 'Unknown'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Coordinates</p>
              <p className="font-mono text-sm">
                {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Accuracy Radius</p>
              <p>{locationData.radius ? `${locationData.radius} meters` : 'Unknown'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Last Updated</p>
              <p>
                {locationData.timestamp 
                  ? formatDistance(new Date(locationData.timestamp), new Date(), { addSuffix: true })
                  : 'Unknown'
                }
              </p>
            </div>
          </>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <p className="font-medium">No Location Data Available</p>
            </div>
            <p className="text-sm text-gray-400">
              Location data could not be retrieved for this unit. This might be because:
            </p>
            <ul className="text-sm text-gray-400 mt-2 space-y-1 list-disc list-inside">
              <li>The unit is not connected to the network</li>
              <li>Location services are not enabled</li>
              <li>The ICCID is not recognized by the location service</li>
              <li>The unit hasn't reported its location recently</li>
            </ul>
            <p className="text-sm text-gray-400 mt-2">
              Try refreshing the location data using the "Refresh Location" button.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
