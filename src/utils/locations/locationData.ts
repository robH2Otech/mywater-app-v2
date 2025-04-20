
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
  // Slovenia location for 003 unit (from 1oT console data)
  'default': {
    latitude: 45.9646,
    longitude: 14.2932, 
    radius: 1896,
    cellId: 'mock-cell-default',
    deviceName: 'MYWATER 003 UVC',
    lastCountry: 'Slovenia',
    lastOperator: 'Mobitel',
    timestamp: new Date().toISOString()
  },
  // Slovenia location from 1oT console
  'si-mock-001': {
    latitude: 45.9646,
    longitude: 14.2932,
    radius: 1896,
    cellId: 'mock-cell-sl-001',
    deviceName: 'Slovenia Device',
    lastCountry: 'Slovenia',
    lastOperator: 'Mobitel',
    timestamp: new Date().toISOString()
  },
  // For specific units with their actual ICCIDs
  '894450270122185223': {
    latitude: 45.9646,
    longitude: 14.2932,
    radius: 1896,
    cellId: 'mock-cell-003',
    deviceName: 'MYWATER 003 UVC',
    lastCountry: 'Slovenia',
    lastOperator: 'Mobitel',
    timestamp: new Date().toISOString()
  },
  '894450270122185222': {
    latitude: 45.9646,
    longitude: 14.2932,
    radius: 1896,
    cellId: 'mock-cell-002',
    deviceName: 'MYWATER 002',
    lastCountry: 'Slovenia',
    lastOperator: 'Mobitel',
    timestamp: new Date().toISOString()
  },
  '894450270122185221': {
    latitude: 45.9646,
    longitude: 14.2932,
    radius: 1896,
    cellId: 'mock-cell-001',
    deviceName: 'MYWATER 001',
    lastCountry: 'Slovenia',
    lastOperator: 'Mobitel',
    timestamp: new Date().toISOString()
  }
};
