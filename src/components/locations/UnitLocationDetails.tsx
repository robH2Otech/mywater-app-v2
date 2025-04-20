
import React from 'react';
import { Card } from '@/components/ui/card';
import { LocationData } from '@/utils/locations/locationData';
import { formatDistance } from 'date-fns';

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
        </div>
      </Card>
    );
  }

  if (!locationData) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Location Details</h3>
        <p className="text-gray-400">No location data available for this unit.</p>
      </Card>
    );
  }

  const timestamp = locationData.timestamp 
    ? formatDistance(new Date(locationData.timestamp), new Date(), { addSuffix: true })
    : 'Unknown';

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Location Details</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">Unit Name</p>
          <p className="font-semibold">{unitName || 'Unknown'}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-400">ICCID</p>
          <p className="font-mono text-sm">{iccid}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-400">Device Name</p>
          <p>{locationData.deviceName || 'N/A'}</p>
        </div>
        
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
          <p>{timestamp}</p>
        </div>
      </div>
    </Card>
  );
};
