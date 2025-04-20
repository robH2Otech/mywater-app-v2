
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
      // Normalize ICCID by removing any potential formatting
      const normalizedIccid = iccid.replace(/\s+/g, '').trim();
      console.log(`Fetching location for normalized ICCID: ${normalizedIccid}`);
      
      // Check if this unit has location history first
      const hasLocationHistory = await verifyLocationUpdates(normalizedIccid);
      console.log(`Unit with ICCID ${normalizedIccid} has location history: ${hasLocationHistory}`);
      
      // Call the Cloud Function to get real location data
      const manualUpdate = httpsCallable<
        { iccid: string },
        { success: boolean; location: LocationData }
      >(functions, 'manualLocationUpdate');

      const result = await manualUpdate({ iccid: normalizedIccid });
      console.log("Location update result:", result.data);
      
      if (result.data.success && result.data.location) {
        const location = result.data.location;
        console.log("Location data received:", location);
        setLocationData(location);
        toast.success("Location data updated successfully");
        return location;
      } else {
        // Fall back to mock data for development/testing environments
        const isDevelopment = window.location.hostname.includes('localhost') || 
                              window.location.hostname.includes('lovable');
                              
        if (isDevelopment) {
          console.log(`No location data from API for ${normalizedIccid}, using mock data`);
          // Prioritize matching exact ICCID in mock data
          let mockLocationKey = normalizedIccid;
          
          // If no exact match, try partial match
          if (!MOCK_LOCATIONS[mockLocationKey]) {
            mockLocationKey = Object.keys(MOCK_LOCATIONS).find(key => 
              key.includes(normalizedIccid) || normalizedIccid.includes(key)
            ) || 'default';
          }
          
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
        try {
          console.log('Using fallback mock data after error');
          // Try to match ICCID with a specific mock
          const normalizedIccid = iccid.replace(/\s+/g, '').trim();
          
          // Try exact match first
          if (MOCK_LOCATIONS[normalizedIccid]) {
            setLocationData(MOCK_LOCATIONS[normalizedIccid]);
            return MOCK_LOCATIONS[normalizedIccid];
          }
          
          // Then try partial match
          const mockKey = Object.keys(MOCK_LOCATIONS).find(key => 
            key.includes(normalizedIccid) || normalizedIccid.includes(key)
          );
          
          if (mockKey) {
            setLocationData(MOCK_LOCATIONS[mockKey]);
            return MOCK_LOCATIONS[mockKey];
          }
          
          // Last resort - default mock
          setLocationData(MOCK_LOCATIONS['default']);
          return MOCK_LOCATIONS['default'];
        } catch (mockErr) {
          console.error("Error using fallback mock data:", mockErr);
          return null;
        }
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
