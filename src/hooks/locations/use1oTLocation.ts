
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { LocationData } from '@/utils/locations/locationData';
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
        if (window.location.hostname.includes('localhost') || 
            window.location.hostname.includes('lovable')) {
          const { MOCK_LOCATIONS } = await import('@/utils/locations/locationData');
          const mockLocation = MOCK_LOCATIONS[iccid] || MOCK_LOCATIONS.default;
          console.log("Using mock location data:", mockLocation);
          setLocationData(mockLocation);
          toast.success("Using mock location data (development)");
          return mockLocation;
        }
        
        throw new Error("Failed to update location data");
      }

    } catch (err) {
      console.error("Error fetching location data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error("Failed to load location data. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    locationData,
    fetchLocationData,
  };
};
