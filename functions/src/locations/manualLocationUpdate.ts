
import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from '../utils/adminInit';
import { authenticate, getDeviceLocation } from './oneotApi';
import { storeLocationData } from './locationStorage';
import { BusinessUserError, createHttpsError, logFunctionStart, logFunctionStep, logFunctionSuccess, logFunctionError } from '../utils/errorUtils';

/**
 * Cloud Function to update location for a specific ICCID (on-demand)
 */
export const manualLocationUpdate = onCall({
  cors: true,
  secrets: ['ONEOT_API_KEY', 'ONEOT_API_SECRET', 'ONEOT_ENDPOINT']
}, async (request) => {
  const functionName = 'manualLocationUpdate';
  const { data, auth: context } = request;
  
  try {
    logFunctionStart(functionName, data, context);
    
    // Ensure user is authenticated
    if (!context) {
      throw new BusinessUserError('UNAUTHENTICATED', 'User must be authenticated to update unit location', {}, 'authentication_check');
    }
    
    const { iccid } = data;
    
    if (!iccid) {
      throw new BusinessUserError('VALIDATION_ERROR', 'ICCID is required', { iccid }, 'input_validation');
    }
    
    logFunctionStep('finding_unit_with_iccid', { iccid });
    
    // Find unit with this ICCID
    const db = getFirestore();
    const unitsRef = db.collection('units');
    
    // First try exact match
    let unitQuery = await unitsRef.where('iccid', '==', iccid).limit(1).get();
    
    if (unitQuery.empty) {
      logFunctionStep('trying_partial_match', { iccid });
      
      // Try contains match (both directions)
      const allUnits = await unitsRef.get();
      const matchingUnits = allUnits.docs.filter(doc => {
        const unitData = doc.data();
        return unitData.iccid && (
          unitData.iccid.includes(iccid) || iccid.includes(unitData.iccid)
        );
      });
      
      if (matchingUnits.length > 0) {
        // If multiple matches, take the closest match by length
        matchingUnits.sort((a, b) => {
          return Math.abs(a.data().iccid.length - iccid.length) - 
                 Math.abs(b.data().iccid.length - iccid.length);
        });
        
        const unitId = matchingUnits[0].id;
        const unitData = matchingUnits[0].data();
        
        logFunctionStep('unit_found_partial_match', { unitId, actualIccid: unitData.iccid });
        
        // Use the unit's actual ICCID for the API request
        const actualIccid = unitData.iccid;
        
        // Authenticate with 1oT API
        const token = await authenticate();
        
        // Get location data
        const locationData = await getDeviceLocation(actualIccid, token);
        
        // Store location data
        await storeLocationData(unitId, locationData);
        
        const result = {
          success: true,
          location: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            radius: locationData.radius,
            lastCountry: locationData.lastCountry,
            lastOperator: locationData.lastOperator,
            timestamp: new Date().toISOString()
          }
        };
        
        logFunctionSuccess(functionName, result);
        return result;
      } else {
        throw new BusinessUserError('NOT_FOUND', `No unit found with ICCID ${iccid}`, { iccid }, 'unit_lookup');
      }
    } else {
      const unitId = unitQuery.docs[0].id;
      const unitData = unitQuery.docs[0].data();
      
      logFunctionStep('unit_found_exact_match', { unitId, iccid: unitData.iccid });
      
      // Authenticate with 1oT API
      const token = await authenticate();
      
      // Get location data
      const locationData = await getDeviceLocation(unitData.iccid, token);
      
      // Store location data
      await storeLocationData(unitId, locationData);
      
      const result = {
        success: true,
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          radius: locationData.radius,
          lastCountry: locationData.lastCountry,
          lastOperator: locationData.lastOperator,
          timestamp: new Date().toISOString()
        }
      };
      
      logFunctionSuccess(functionName, result);
      return result;
    }
  } catch (error: any) {
    logFunctionError(functionName, error);
    
    if (error instanceof BusinessUserError) {
      throw createHttpsError(error);
    }
    
    const businessError = new BusinessUserError('INTERNAL', `Failed to update location: ${error.message}`, { originalError: error }, 'location_update');
    throw createHttpsError(businessError);
  }
});
