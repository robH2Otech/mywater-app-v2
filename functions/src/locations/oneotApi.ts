
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
    throw new Error(`1oT Authentication failed: ${response.status} ${errorText}`);
  }
  
  const data = await response.json() as OneOTAuthResponse;
  return data.access_token;
}

/**
 * Get device location from 1oT API
 */
export async function getDeviceLocation(iccid: string, token: string): Promise<OneOTDiagnosticsResponse> {
  const endpoint = functions.config().oneot?.endpoint || 'https://api.1ot.com/v1';
  const response = await fetch(`${endpoint}/diagnostics/${iccid}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get device location for ${iccid}: ${response.status} ${errorText}`);
  }
  
  return response.json() as Promise<OneOTDiagnosticsResponse>;
}
