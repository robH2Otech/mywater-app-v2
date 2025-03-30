import { collection, doc, addDoc, getDocs, query, orderBy, limit, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Measurement } from './types';
import { formatTimestamp } from './formatUtils';

/**
 * Add a new measurement to a water unit
 */
export const addMeasurement = async (unitId: string, volume: number, temperature: number, uvcHours?: number) => {
  try {
    // Get the unit document to read the current total_volume
    const unitDocRef = doc(db, "units", unitId);
    const unitDoc = await getDoc(unitDocRef);
    
    if (!unitDoc.exists()) {
      throw new Error(`Unit ${unitId} not found`);
    }
    
    const unitData = unitDoc.data();
    
    // Parse the current total volume, ensuring it's a number
    const currentTotalVolume = typeof unitData.total_volume === 'number' 
      ? unitData.total_volume 
      : typeof unitData.total_volume === 'string' 
        ? parseFloat(unitData.total_volume) 
        : 0;
    
    // Parse the current UVC hours, ensuring it's a number
    const currentUVCHours = typeof unitData.uvc_hours === 'number'
      ? unitData.uvc_hours
      : typeof unitData.uvc_hours === 'string'
        ? parseFloat(unitData.uvc_hours)
        : 0;
    
    // Calculate new total volume by adding current volume
    const newTotalVolume = currentTotalVolume + volume;
    
    // Create the new measurement
    const now = new Date();
    const formattedTimestamp = formatTimestamp(now);
    
    const measurementData: Measurement = {
      timestamp: formattedTimestamp,
      raw_timestamp: serverTimestamp(),
      volume,
      temperature,
      cumulative_volume: newTotalVolume,
      ...(uvcHours !== undefined && { uvc_hours: uvcHours })
    };
    
    // Determine the collection path based on unit ID
    const isMyWaterUnit = unitId.startsWith('MYWATER_');
    const collectionPath = isMyWaterUnit ? `units/${unitId}/data` : `units/${unitId}/measurements`;
    
    // Add the new measurement
    const measurementsCollectionRef = collection(db, collectionPath);
    const newMeasurementRef = await addDoc(measurementsCollectionRef, measurementData);
    
    // Update the unit's total_volume and uvc_hours if provided
    const updateData: any = {
      total_volume: newTotalVolume,
      updated_at: formattedTimestamp
    };
    
    // Only update UVC hours if a value was provided in the measurement
    if (uvcHours !== undefined) {
      // Add the new UVC hours to the current total
      const newUVCHours = currentUVCHours + uvcHours;
      console.log(`Updating UVC hours for ${unitId}: ${currentUVCHours} + ${uvcHours} = ${newUVCHours}`);
      updateData.uvc_hours = newUVCHours;
    }
    
    await updateDoc(unitDocRef, updateData);

    console.log(`Measurement added for ${unitId}: volume=${volume}, total=${newTotalVolume}, uvcHours=${uvcHours}`);
    
    return newMeasurementRef.id;
  } catch (error) {
    console.error("Error adding measurement:", error);
    throw error;
  }
};

/**
 * Get the latest measurements for a water unit
 */
export const getLatestMeasurements = async (unitId: string, count: number = 24) => {
  try {
    // Get the unit document to read the current total_volume (for reference)
    const unitDocRef = doc(db, "units", unitId);
    const unitDoc = await getDoc(unitDocRef);
    const unitData = unitDoc.exists() ? unitDoc.data() : null;
    const unitTotalVolume = unitData?.total_volume || 0;
    
    // Determine the collection path based on unit ID
    const isMyWaterUnit = unitId.startsWith('MYWATER_');
    const collectionPath = isMyWaterUnit ? `units/${unitId}/data` : `units/${unitId}/measurements`;
    
    const measurementsCollectionRef = collection(db, collectionPath);
    const q = query(
      measurementsCollectionRef,
      orderBy("timestamp", "desc"),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    
    // Process measurements and ensure cumulative volume is set
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Ensure proper timestamp formatting when retrieving data
      if (data.timestamp) {
        try {
          // If it's a Firestore timestamp with toDate method
          if (typeof data.timestamp === 'object' && data.timestamp !== null && typeof data.timestamp.toDate === 'function') {
            const date = data.timestamp.toDate();
            data.timestamp = formatTimestamp(date);
          }
          // Otherwise, assume it's already in the correct string format
        } catch (err) {
          console.error("Error formatting timestamp in getLatestMeasurements:", err);
        }
      }
      
      // Ensure cumulative_volume is populated
      if (data.cumulative_volume === undefined || data.cumulative_volume === null) {
        // If missing, use unit's current total - this should be improved with proper calculations 
        data.cumulative_volume = unitTotalVolume;
      }
      
      return {
        id: doc.id,
        ...data
      };
    }) as (Measurement & { id: string })[];
  } catch (error) {
    console.error("Error getting latest measurements:", error);
    throw error;
  }
};

/**
 * Recalculate cumulative volumes for a unit's measurements
 */
export const recalculateCumulativeVolumes = async (unitId: string) => {
  try {
    const isMyWaterUnit = unitId.startsWith('MYWATER_');
    const collectionPath = isMyWaterUnit ? `units/${unitId}/data` : `units/${unitId}/measurements`;
    
    const measurementsCollectionRef = collection(db, collectionPath);
    const q = query(
      measurementsCollectionRef,
      orderBy("timestamp", "asc") // Process in chronological order
    );
    
    const snapshot = await getDocs(q);
    const measurements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Measurement
    }));
    
    // Get the unit's starting volume
    const unitDocRef = doc(db, "units", unitId);
    const unitDoc = await getDoc(unitDocRef);
    const startingVolume = unitDoc.exists() ? (unitDoc.data().starting_volume || 0) : 0;
    
    // Recalculate cumulative volumes
    let cumulativeVolume = startingVolume;
    
    // Update each measurement with the proper cumulative volume
    for (const measurement of measurements) {
      const volume = typeof measurement.volume === 'number' ? measurement.volume : 0;
      cumulativeVolume += volume;
      
      const measurementDocRef = doc(db, collectionPath, measurement.id);
      await updateDoc(measurementDocRef, {
        cumulative_volume: cumulativeVolume
      });
    }
    
    // Update the unit's total_volume to match the final cumulative value
    await updateDoc(unitDocRef, {
      total_volume: cumulativeVolume,
      updated_at: new Date().toISOString()
    });
    
    return cumulativeVolume;
  } catch (error) {
    console.error("Error recalculating cumulative volumes:", error);
    throw error;
  }
};
