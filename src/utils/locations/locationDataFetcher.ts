
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { UnitData } from '@/types/analytics';
import { MOCK_LOCATIONS } from './locationData';

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

export async function fetchAndStoreLocationData() {
  try {
    // 1. Get all active units from Firestore
    const unitsCollection = collection(db, "units");
    const unitsSnapshot = await getDocs(unitsCollection);
    const units = unitsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UnitData[];

    console.log(`Found ${units.length} units to process`);

    // 2. Process each unit
    for (const unit of units) {
      if (!unit.iccid) {
        console.log(`Skipping unit ${unit.id} - No ICCID found`);
        continue;
      }

      try {
        // Use the mock data in development/test environments
        const isDevelopment = window.location.hostname.includes('localhost') || 
                            window.location.hostname.includes('lovableproject') || 
                            window.location.hostname.includes('lovable');

        let locationData;
        
        if (isDevelopment) {
          // Use mock data from locationData.ts
          const mockData = MOCK_LOCATIONS[unit.iccid] || MOCK_LOCATIONS.default;
          locationData = {
            lastKnownLatitude: mockData.latitude,
            lastKnownLongitude: mockData.longitude,
            lastKnownRadius: mockData.radius,
            lastKnownCountry: mockData.lastCountry,
            lastKnownOperator: mockData.lastOperator,
            locationLastFetchedAt: new Date().toISOString()
          };
        } else {
          // In production, this would be replaced with actual 1oT API calls
          console.log(`Production environment - would fetch real data for ICCID: ${unit.iccid}`);
          continue;
        }

        // Update Firestore with location data
        const unitRef = doc(db, "units", unit.id);
        await updateDoc(unitRef, locationData);
        
        console.log(`Successfully updated location data for unit ${unit.id}`);

      } catch (error) {
        console.error(`Error processing unit ${unit.id}:`, error);
        // Continue with next unit
      }
    }

    console.log('Location data update completed');
    return true;

  } catch (error) {
    console.error('Error in fetchAndStoreLocationData:', error);
    throw error;
  }
}

