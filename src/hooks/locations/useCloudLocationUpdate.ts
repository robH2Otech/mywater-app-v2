
import { useState } from 'react';
import { httpsCallable, Functions } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { toast } from 'sonner';
import { LocationData } from '@/utils/locations/locationData';

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
      const updateFn = httpsCallable<
        { unitId: string; iccid: string },
        { success: boolean; location: LocationData }
      >(functions, 'updateUnitLocation');

      toast.info('Requesting location data update...');

      const result = await updateFn({ unitId, iccid });
      
      if (result.data.success) {
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
