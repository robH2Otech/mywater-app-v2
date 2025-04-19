
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { LocationData, MOCK_LOCATIONS } from '@/utils/locations/locationData';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { verifyLocationUpdates } from '@/utils/locations/verifyLocationUpdates';

export const use1oTLocation = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const functions = getFunctions();

  const fetchLocationData = useCallback(async (iccid: string) => {
    if (!iccid) {
      setError("No ICCID provided");
      toast.error("ICCID is required to fetch location data");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching location for ICCID: ${iccid}`);
      
      // Call the manual location update function
      const manualUpdate = httpsCallable<
        { iccid: string },
        { success: boolean; location: LocationData }
      >(functions, 'manualLocationUpdate');

      const result = await manualUpdate({ iccid });
      console.log("Location update result:", result.data);
      
      if (result.data.success && result.data.location) {
        const location = result.data.location;
        setLocationData(location);
        toast.success("Location data updated successfully");
        return location;
      } else {
        // Try client-side fallback for development environment
        const isDevelopment = window.location.hostname.includes('localhost') || 
                            window.location.hostname.includes('lovable');
                            
        if (isDevelopment) {
          // Try to find best matching mock data
          const mockLocationKey = Object.keys(MOCK_LOCATIONS).find(key => 
            key === iccid || key.includes(iccid) || iccid.includes(key)
          ) || 'default';
          
          const mockLocation = MOCK_LOCATIONS[mockLocationKey];
          console.log("Using mock location data:", mockLocation);
          setLocationData(mockLocation);
          toast.success("Using mock location data (development)");
          return mockLocation;
        }
        
        throw new Error("Failed to update location data");
      }

    } catch (err) {
      console.error("Error fetching location data:", err);
      // Check if error is from Firebase Functions
      let errorMessage = "Failed to load location data";
      
      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as Error).message;
      }
      
      // Try to verify if the unit has any location history data
      if (iccid) {
        try {
          // This will check if there are any location updates for this unit
          const hasLocationHistory = await verifyLocationUpdates(iccid);
          
          if (hasLocationHistory) {
            errorMessage += ". Previous location data exists but couldn't be retrieved.";
          }
        } catch (verifyErr) {
          console.error("Error verifying location history:", verifyErr);
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Try development fallback one more time
      if (window.location.hostname.includes('localhost') || 
          window.location.hostname.includes('lovable')) {
        const mockData = MOCK_LOCATIONS[iccid] || MOCK_LOCATIONS.default;
        setLocationData(mockData);
        return mockData;
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [functions]);

  return {
    isLoading,
    error,
    locationData,
    fetchLocationData,
  };
};
