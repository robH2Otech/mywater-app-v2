
import { logger } from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import fetch from 'node-fetch';

// Define secrets for 1oT API credentials
const oneotApiKey = defineSecret('ONEOT_API_KEY');
const oneotApiSecret = defineSecret('ONEOT_API_SECRET');
const oneotEndpoint = defineSecret('ONEOT_ENDPOINT');

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
  const apiKey = oneotApiKey.value();
  const apiSecret = oneotApiSecret.value();
  
  if (!apiKey || !apiSecret) {
    throw new Error('1oT API credentials not configured');
  }
  
  const endpoint = oneotEndpoint.value() || 'https://api.1ot.com/v1';
  
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
      logger.error(`1oT Authentication failed: ${response.status}`, errorText);
      throw new Error(`1oT Authentication failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as OneOTAuthResponse;
    logger.debug('Successfully authenticated with 1oT API');
    return data.access_token;
  } catch (error) {
    logger.error('Error authenticating with 1oT API:', error);
    throw new Error(`1oT Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get device location from 1oT API
 */
export async function getDeviceLocation(iccid: string, token: string): Promise<OneOTDiagnosticsResponse> {
  const endpoint = oneotEndpoint.value() || 'https://api.1ot.com/v1';
  
  try {
    logger.info(`Requesting location data for ICCID: ${iccid}`);
    
    const response = await fetch(`${endpoint}/diagnostics/${iccid}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Failed to get device location for ${iccid}: ${response.status}`, errorText);
      throw new Error(`Failed to get device location for ${iccid}: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as OneOTDiagnosticsResponse;
    
    // Validate location data
    if (!data.latitude || !data.longitude) {
      logger.error(`Invalid location data received for ${iccid}`, data);
      throw new Error(`Invalid location data received for ${iccid}`);
    }
    
    logger.info(`Successfully retrieved location for ${iccid}: ${data.latitude}, ${data.longitude}`);
    return data;
  } catch (error) {
    logger.error(`Error getting location for ${iccid}:`, error);
    throw new Error(`Error getting location: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
