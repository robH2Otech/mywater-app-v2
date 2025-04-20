
import { useState, useEffect } from 'react';
import { useCloudLocationUpdate } from './useCloudLocationUpdate';
import { LocationData } from '@/utils/locations/locationData';
import { toast } from 'sonner';

export const useUnitLocation = (unitId: string | undefined, iccid: string | undefined) => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { updateUnitLocation, isUpdating } = useCloudLocationUpdate();

  const fetchLocation = async () => {
    setIsLoading(true);
    setError(null);

    if (!unitId || !iccid) {
      setError('Missing unit ID or ICCID');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Fetching location for unit: ${unitId}, ICCID: ${iccid}`);
      const data = await updateUnitLocation(unitId, iccid);
      
      if (data) {
        console.log('Location data received:', data);
        setLocationData(data);
      } else {
        console.log('No location data received');
        setError('Unable to retrieve location data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching location:', errorMessage);
      setError(`Failed to fetch location: ${errorMessage}`);
      toast.error(`Location update failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch location on mount
  useEffect(() => {
    if (unitId && iccid) {
      fetchLocation();
    } else {
      setIsLoading(false);
    }
  }, [unitId, iccid]);

  return {
    locationData,
    isLoading: isLoading || isUpdating,
    error,
    refreshLocation: fetchLocation
  };
};
