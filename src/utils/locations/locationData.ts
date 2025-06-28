
// Types definitions based on 1oT API response
export interface Location1oTResponse {
  imei: string;
  deviceName: string;
  inDataSession: boolean;
  lastNetworkActivity: number;
  lastCountry: string;
  lastOperator: string;
  latitude: number;
  longitude: number;
  radius: number;
}

// Simplified data structure for our app usage
export interface LocationData {
  latitude: number;
  longitude: number;
  radius: number;
  cellId?: string;
  timestamp?: string;
  deviceName?: string;
  lastCountry?: string;
  lastOperator?: string;
}

// Mock location data for different units when in development environment
export const MOCK_LOCATIONS: Record<string, LocationData> = {
  // Slovenia location for default/fallback
  'default': {
    latitude: 45.9646,
    longitude: 14.2932, 
    radius: 1896,
    cellId: 'mock-cell-default',
    lastCountry: 'Slovenia',
    lastOperator: 'Mobitel',
    timestamp: new Date().toISOString()
  },
  // X-WATER 000 with correct ICCID
  '8988228066612765158': {
    latitude: 45.9646,
    longitude: 14.2932,
    radius: 1896,
    cellId: 'mock-cell-xwater-000',
    lastCountry: 'Slovenia',
    lastOperator: 'Mobitel',
    timestamp: new Date().toISOString()
  },
  // For existing units with their ICCIDs
  '894450270122185223': {
    latitude: 45.9646,
    longitude: 14.2932,
    radius: 1896,
    cellId: 'mock-cell-003',
    lastCountry: 'Slovenia',
    lastOperator: 'Mobitel',
    timestamp: new Date().toISOString()
  },
  '894450270122185222': {
    latitude: 45.9646,
    longitude: 14.2932,
    radius: 1896,
    cellId: 'mock-cell-002',
    lastCountry: 'Slovenia',
    lastOperator: 'Mobitel',
    timestamp: new Date().toISOString()
  },
  '894450270122185221': {
    latitude: 45.9646,
    longitude: 14.2932,
    radius: 1896,
    cellId: 'mock-cell-001',
    lastCountry: 'Slovenia',
    lastOperator: 'Mobitel',
    timestamp: new Date().toISOString()
  }
};
