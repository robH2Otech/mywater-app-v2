
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
    console.log('useUnitLocation - fetchLocation called with:', { unitId, iccid });
    setIsLoading(true);
    setError(null);

    if (!unitId && !iccid) {
      const errorMsg = 'Missing both unit ID and ICCID - cannot fetch location';
      console.error('useUnitLocation -', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    if (!iccid) {
      const errorMsg = 'Missing ICCID - required for location updates';
      console.error('useUnitLocation -', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      console.log(`useUnitLocation - Fetching location for unit: ${unitId}, ICCID: ${iccid}`);
      
      // Use the actual ICCID for the update, fallback to unitId if needed
      const targetUnitId = unitId || 'unknown';
      const data = await updateUnitLocation(targetUnitId, iccid);
      
      if (data) {
        console.log('useUnitLocation - Location data received:', data);
        setLocationData(data);
        setError(null);
      } else {
        console.log('useUnitLocation - No location data received');
        const errorMsg = 'Unable to retrieve location data for this unit';
        setError(errorMsg);
        
        // Don't show toast for "no data" case as it's handled in the UI
        console.warn('useUnitLocation -', errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('useUnitLocation - Error fetching location:', errorMessage);
      setError(`Failed to fetch location: ${errorMessage}`);
      toast.error(`Location update failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch location on mount
  useEffect(() => {
    if (iccid) {
      console.log('useUnitLocation - useEffect triggered, fetching location');
      fetchLocation();
    } else {
      console.log('useUnitLocation - No ICCID provided, skipping fetch');
      setIsLoading(false);
      setError('No ICCID provided');
    }
  }, [unitId, iccid]);

  return {
    locationData,
    isLoading: isLoading || isUpdating,
    error,
    refreshLocation: fetchLocation
  };
};
