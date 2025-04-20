
import { useState } from 'react';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { toast } from 'sonner';
import { LocationData } from '@/utils/locations/locationData';
import { verifyLocationUpdates } from '@/utils/locations/verifyLocationUpdates';

export const useCloudLocationUpdate = () => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const functions = getFunctions();

  const updateUnitLocation = async (unitId: string, iccid: string): Promise<LocationData | null> => {
    if (!unitId || !iccid) {
      const errorMsg = 'Unit ID and ICCID are required to update location';
      toast.error(errorMsg);
      setError(errorMsg);
      return null;
    }

    setIsUpdating(true);
    setError(null);
    
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
        const errorMsg = 'Failed to update location data';
        toast.error(errorMsg);
        setError(errorMsg);
        
        // Add fallback to mock data for development
        if (window.location.hostname.includes('localhost') || 
            window.location.hostname.includes('lovable')) {
          console.log('Using fallback mock data in development environment');
          
          // Try to match the ICCID with our mock data
          const mockLocation = MOCK_LOCATIONS[normalizedIccid] || MOCK_LOCATIONS['default'];
          return mockLocation;
        }
        
        return null;
      }
    } catch (error) {
      console.error('Error updating location:', error);
      const errorMsg = `Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}`;
      toast.error(errorMsg);
      setError(errorMsg);
      
      // Development environment fallback
      if (window.location.hostname.includes('localhost') || 
          window.location.hostname.includes('lovable')) {
        console.log('Using fallback mock data after error');
        
        // Try to match the ICCID with our mock data
        const normalizedIccid = iccid.replace(/\s+/g, '').trim();
        const mockLocation = MOCK_LOCATIONS[normalizedIccid] || MOCK_LOCATIONS['default'];
        return mockLocation;
      }
      
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    error,
    updateUnitLocation
  };
};
