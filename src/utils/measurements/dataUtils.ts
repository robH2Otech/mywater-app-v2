
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
    const currentTotalVolume = parseFloat(unitData.total_volume || "0");
    
    // Create the new measurement
    // Include both server timestamp and formatted human-readable timestamp
    const now = new Date();
    const formattedTimestamp = formatTimestamp(now);
    
    const measurementData: Measurement = {
      // Set the formatted timestamp
      timestamp: formattedTimestamp,
      
      // Include raw timestamp for Firestore ordering
      raw_timestamp: serverTimestamp(),
      
      volume,
      temperature,
      cumulative_volume: currentTotalVolume + volume,
      ...(uvcHours !== undefined && { uvc_hours: uvcHours })
    };
    
    // Determine the collection path based on unit ID
    const isMyWaterUnit = unitId.startsWith('MYWATER_');
    const collectionPath = isMyWaterUnit ? `units/${unitId}/data` : `units/${unitId}/measurements`;
    
    // Add as a new document with a random ID
    const measurementsCollectionRef = collection(db, collectionPath);
    const newMeasurementRef = await addDoc(measurementsCollectionRef, measurementData);
    const measurementId = newMeasurementRef.id;
    console.log(`Measurement added with ID: ${measurementId} to ${collectionPath}`);
    
    // Update the unit's total_volume with the new cumulative value
    // Also update the UVC hours if provided
    const updateData: any = {
      total_volume: measurementData.cumulative_volume,
      updated_at: formattedTimestamp
    };
    
    // Update UVC hours if provided
    if (uvcHours !== undefined) {
      // Get current UVC hours and add the new hours
      const currentUVCHours = unitData.uvc_hours || 0;
      updateData.uvc_hours = currentUVCHours + uvcHours;
    }
    
    await updateDoc(unitDocRef, updateData);
    
    return measurementId;
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
