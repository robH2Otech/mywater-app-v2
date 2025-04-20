
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { LocationData, MOCK_LOCATIONS } from '@/utils/locations/locationData';
import { httpsCallable, getFunctions } from 'firebase/functions';

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
      
      // Call the Cloud Function to get real location data
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
        // Fall back to mock data for development/testing environments
        const isDevelopment = window.location.hostname.includes('localhost') || 
                            window.location.hostname.includes('lovable');
                            
        if (isDevelopment) {
          // Try to find a matching mock data or use default
          const mockLocationKey = Object.keys(MOCK_LOCATIONS).find(key => 
            key === iccid || key.includes(iccid) || iccid.includes(key)
          ) || 'default';
          
          const mockLocation = MOCK_LOCATIONS[mockLocationKey];
          console.log("Using mock location data:", mockLocation);
          setLocationData(mockLocation);
          toast.success("Using mock location data (development environment)");
          return mockLocation;
        }
        
        throw new Error("Failed to update location data");
      }

    } catch (err) {
      console.error("Error fetching location data:", err);
      setError(`Failed to load location data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error(`Error loading location data`);
      
      // Final fallback to mock data for development environments
      if (window.location.hostname.includes('localhost') || 
          window.location.hostname.includes('lovable')) {
        const mockData = MOCK_LOCATIONS['default'];
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
