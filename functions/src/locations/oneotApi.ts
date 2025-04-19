
import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

interface OneOTAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface OneOTDiagnosticsResponse {
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

/**
 * Authenticate with 1oT API
 */
export async function authenticate(): Promise<string> {
  const apiKey = functions.config().oneot?.api_key || '';
  const apiSecret = functions.config().oneot?.api_secret || '';
  
  if (!apiKey || !apiSecret) {
    throw new Error('1oT API credentials not configured');
  }
  
  const endpoint = functions.config().oneot?.endpoint || 'https://api.1ot.com/v1';
  
  try {
    const response = await fetch(`${endpoint}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        api_secret: apiSecret
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      functions.logger.error(`1oT Authentication failed: ${response.status}`, errorText);
      throw new Error(`1oT Authentication failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as OneOTAuthResponse;
    functions.logger.debug('Successfully authenticated with 1oT API');
    return data.access_token;
  } catch (error) {
    functions.logger.error('Error authenticating with 1oT API:', error);
    throw new Error(`1oT Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get device location from 1oT API
 */
export async function getDeviceLocation(iccid: string, token: string): Promise<OneOTDiagnosticsResponse> {
  const endpoint = functions.config().oneot?.endpoint || 'https://api.1ot.com/v1';
  
  try {
    functions.logger.info(`Requesting location data for ICCID: ${iccid}`);
    
    const response = await fetch(`${endpoint}/diagnostics/${iccid}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      functions.logger.error(`Failed to get device location for ${iccid}: ${response.status}`, errorText);
      throw new Error(`Failed to get device location for ${iccid}: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as OneOTDiagnosticsResponse;
    
    // Validate location data
    if (!data.latitude || !data.longitude) {
      functions.logger.error(`Invalid location data received for ${iccid}`, data);
      throw new Error(`Invalid location data received for ${iccid}`);
    }
    
    functions.logger.info(`Successfully retrieved location for ${iccid}: ${data.latitude}, ${data.longitude}`);
    return data;
  } catch (error) {
    functions.logger.error(`Error getting location for ${iccid}:`, error);
    throw new Error(`Error getting location: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
