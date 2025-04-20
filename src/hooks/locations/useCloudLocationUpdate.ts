
import { useState } from 'react';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { toast } from 'sonner';
import { LocationData } from '@/utils/locations/locationData';
import { verifyLocationUpdates } from '@/utils/locations/verifyLocationUpdates';

export const useCloudLocationUpdate = () => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const functions = getFunctions();

  const updateUnitLocation = async (unitId: string, iccid: string): Promise<LocationData | null> => {
    if (!unitId || !iccid) {
      toast.error('Unit ID and ICCID are required to update location');
      return null;
    }

    setIsUpdating(true);
    try {
      toast.info('Requesting location data update...');
      console.log(`Requesting location update for ICCID: ${iccid} (Unit ID: ${unitId})`);
      
      // First verify if this ICCID has any location updates
      const hasLocationHistory = await verifyLocationUpdates(iccid);
      console.log(`ICCID ${iccid} has location history: ${hasLocationHistory}`);
      
      // Use the manualLocationUpdate Cloud Function
      const updateFn = httpsCallable<
        { iccid: string },
        { success: boolean; location: LocationData }
      >(functions, 'manualLocationUpdate');

      // Normalize ICCID by removing any potential formatting
      const normalizedIccid = iccid.replace(/\s+/g, '').trim();
      console.log(`Using normalized ICCID for request: ${normalizedIccid}`);
      
      const result = await updateFn({ iccid: normalizedIccid });
      console.log('Location update result:', result.data);
      
      if (result.data.success && result.data.location) {
        toast.success('Location data updated successfully');
        return result.data.location;
      } else {
        toast.error('Failed to update location data');
        return null;
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error(`Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updateUnitLocation
  };
};
