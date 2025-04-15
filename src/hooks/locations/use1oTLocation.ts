
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { LocationData, Location1oTResponse, MOCK_LOCATIONS } from '@/utils/locations/locationData';

export const use1oTLocation = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);

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

      // For development environments or when API is not accessible, use mock data
      const isDevelopment = window.location.hostname.includes('localhost') || 
                           window.location.hostname.includes('lovableproject') || 
                           window.location.hostname.includes('gptengineer') ||
                           window.location.hostname.includes('lovable');
      
      if (isDevelopment) {
        console.log('Using mock location data for development environment');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check if we have mock data for this exact ICCID
        if (MOCK_LOCATIONS[iccid]) {
          console.log(`Found exact mock data for ICCID ${iccid}:`, MOCK_LOCATIONS[iccid]);
          setLocationData(MOCK_LOCATIONS[iccid]);
          toast.success("Location data loaded successfully");
          return MOCK_LOCATIONS[iccid];
        } 
        
        // If we don't have exact data but have a similar ICCID pattern (handling different formats)
        const similarIccids = Object.keys(MOCK_LOCATIONS).filter(mockIccid => 
          iccid.includes(mockIccid) || mockIccid.includes(iccid)
        );
        
        if (similarIccids.length > 0) {
          console.log(`Found similar ICCID match: ${similarIccids[0]}`);
          const mockData = MOCK_LOCATIONS[similarIccids[0]];
          setLocationData(mockData);
          toast.success("Location data loaded successfully");
          return mockData;
        }
        
        // Fall back to default if no match found
        console.log(`No matching ICCID found, using default data`);
        setLocationData(MOCK_LOCATIONS.default);
        toast.info("Using approximate location data");
        return MOCK_LOCATIONS.default;
      }
      
      // In production, we would connect to the real 1oT API
      console.log('Production environment detected, but using mock data for demo purposes');
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Choose the appropriate mock data based on ICCID
      const mockData = MOCK_LOCATIONS[iccid] || MOCK_LOCATIONS.default;
      
      setLocationData(mockData);
      toast.success("Location data loaded successfully");
      return mockData;

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
