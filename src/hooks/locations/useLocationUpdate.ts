
import { useState } from 'react';
import { fetchAndStoreLocationData } from '@/utils/locations/locationDataFetcher';
import { toast } from 'sonner';

export const useLocationUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateLocations = async () => {
    setIsUpdating(true);
    try {
      await fetchAndStoreLocationData();
      toast.success('Location data updated successfully');
    } catch (error) {
      console.error('Error updating locations:', error);
      toast.error('Failed to update location data');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updateLocations
  };
};
