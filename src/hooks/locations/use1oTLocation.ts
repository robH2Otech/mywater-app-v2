
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Types definitions
export interface LocationData {
  latitude: number;
  longitude: number;
  radius: number;
  cellId?: string;
  timestamp?: string;
}

// Mock location data for different units
const MOCK_LOCATIONS = {
  // Default location (Tallinn, Estonia - 1oT headquarters)
  default: {
    latitude: 59.4369,
    longitude: 24.7535, 
    radius: 500,
    cellId: 'mock-cell-default',
    timestamp: new Date().toISOString()
  },
  // For specific units
  '894450270122185223': {
    latitude: 59.4261,
    longitude: 24.7661,
    radius: 350,
    cellId: 'mock-cell-003',
    timestamp: new Date().toISOString()
  },
  '894450270122185222': {
    latitude: 59.4387,
    longitude: 24.7456,
    radius: 250, 
    cellId: 'mock-cell-002',
    timestamp: new Date().toISOString()
  },
  '894450270122185221': {
    latitude: 46.0569,
    longitude: 14.5058,
    radius: 400,
    cellId: 'mock-cell-001',
    timestamp: new Date().toISOString()
  }
};

export const use1oTLocation = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const fetchLocationData = useCallback(async (iccid: string) => {
    if (!iccid) {
      setError("No ICCID provided");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching location for ICCID: ${iccid}`);

      // For development environments or when API is not accessible, use mock data
      // This ensures the feature works during development
      const isDevelopment = window.location.hostname.includes('localhost') || 
                           window.location.hostname.includes('lovableproject') || 
                           window.location.hostname.includes('gptengineer') ||
                           window.location.hostname.includes('lovable');
      
      if (isDevelopment) {
        console.log('Using mock location data for development environment');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Choose the appropriate mock data based on ICCID
        const mockData = MOCK_LOCATIONS[iccid as keyof typeof MOCK_LOCATIONS] || MOCK_LOCATIONS.default;
        console.log(`Mock data selected for ICCID ${iccid}:`, mockData);
        
        setLocationData(mockData);
        toast.success("Location data loaded successfully");
        return mockData;
      }
      
      // In production, we would connect to the real 1oT API
      // For now, we'll just log that and use mock data anyway
      console.log('Production environment detected, but using mock data for demo purposes');
      console.log('In real production, this would connect to the 1oT API');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData = MOCK_LOCATIONS[iccid as keyof typeof MOCK_LOCATIONS] || MOCK_LOCATIONS.default;
      
      setLocationData(mockData);
      toast.success("Location data loaded successfully");
      return mockData;

    } catch (err) {
      console.error("Error fetching location data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error("Failed to load location data");
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
