
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

// Mock location data for different units with the correct coordinates from the images
export const MOCK_LOCATIONS: Record<string, LocationData> = {
  // Default location (Tallinn, Estonia - 1oT headquarters)
  default: {
    latitude: 59.4369,
    longitude: 24.7535, 
    radius: 500,
    cellId: 'mock-cell-default',
    deviceName: 'Default Device',
    lastCountry: 'Estonia',
    lastOperator: 'Telia',
    timestamp: new Date().toISOString()
  },
  // For specific units with their actual ICCIDs
  '894450270122185223': {
    latitude: 59.4261,
    longitude: 24.7661,
    radius: 350,
    cellId: 'mock-cell-003',
    deviceName: 'MYWATER 003 UVC',
    lastCountry: 'Estonia',
    lastOperator: 'Telia',
    timestamp: new Date().toISOString()
  },
  '894450270122185222': {
    latitude: 59.4387,
    longitude: 24.7456,
    radius: 250, 
    cellId: 'mock-cell-002',
    deviceName: 'MYWATER 002',
    lastCountry: 'Estonia',
    lastOperator: 'Telia',
    timestamp: new Date().toISOString()
  },
  '894450270122185221': {
    latitude: 46.0569,
    longitude: 14.5058,
    radius: 400,
    cellId: 'mock-cell-001',
    deviceName: 'MYWATER 001',
    lastCountry: 'Slovenia',
    lastOperator: 'Telekom',
    timestamp: new Date().toISOString()
  }
};

