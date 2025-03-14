
import { collection, doc, addDoc, getDocs, query, orderBy, limit, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

export interface Measurement {
  timestamp: string;
  volume: number;
  temperature: number;
  cumulative_volume: number;
  uvc_hours?: number;
}

// Helper to format dates consistently
const formatTimestamp = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  };
  
  return date.toLocaleString('en-US', options);
};

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
    
    // Create the new measurement with human-readable format
    const now = new Date();
    const timestamp = formatTimestamp(now);
    
    const measurementData: Measurement = {
      timestamp,
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
      updated_at: timestamp
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
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (Measurement & { id: string })[];
  } catch (error) {
    console.error("Error getting latest measurements:", error);
    throw error;
  }
};

/**
 * Initialize sample measurement data for a unit
 */
export const initializeSampleMeasurements = async (unitId: string) => {
  try {
    // Get unit's current total volume as starting point
    const unitDocRef = doc(db, "units", unitId);
    const unitDoc = await getDoc(unitDocRef);
    
    if (!unitDoc.exists()) {
      return;
    }
    
    const unitData = unitDoc.data();
    let cumulativeVolume = parseFloat(unitData.total_volume || "0");
    
    // Determine the collection path based on unit ID
    const isMyWaterUnit = unitId.startsWith('MYWATER_');
    const collectionPath = isMyWaterUnit ? `units/${unitId}/data` : `units/${unitId}/measurements`;
    
    // Create sample measurements for the past 24 hours (1 per hour)
    const now = new Date();
    let cumulativeUvcHours = parseFloat(unitData.uvc_hours || "0");
    
    for (let i = 24; i >= 1; i--) {
      // Create timestamp for this measurement (i hours ago)
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const formattedTimestamp = formatTimestamp(timestamp);
      
      // Generate random volume between 15-35 m³ per hour with two decimal places
      const hourlyVolume = parseFloat((Math.random() * 20 + 15).toFixed(2));
      
      // Generate random temperature between 18-27°C with one decimal place
      const temperature = parseFloat((Math.random() * 9 + 18).toFixed(1));
      
      // Accumulate the volume
      cumulativeVolume += hourlyVolume;
      
      // Add UVC hours with some variation (usually 1 hour per hour)
      const uvcActiveTime = parseFloat((Math.random() > 0.1 ? 1 : 0.5).toFixed(1)); // 90% chance full hour
      cumulativeUvcHours += uvcActiveTime;
      
      // Create the measurement
      const measurementData: Measurement = {
        timestamp: formattedTimestamp,
        volume: hourlyVolume,
        temperature: temperature,
        cumulative_volume: parseFloat(cumulativeVolume.toFixed(2)),
        uvc_hours: parseFloat(cumulativeUvcHours.toFixed(1))
      };
      
      // Add to subcollection with random document ID
      const measurementsCollectionRef = collection(db, collectionPath);
      await addDoc(measurementsCollectionRef, measurementData);
    }
    
    // Update the unit's total volume and UVC hours to match the final cumulative values
    await updateDoc(unitDocRef, {
      total_volume: parseFloat(cumulativeVolume.toFixed(2)),
      uvc_hours: parseFloat(cumulativeUvcHours.toFixed(1)),
      updated_at: formatTimestamp(new Date())
    });
    
    console.log(`Sample measurements added for unit ${unitId} in ${collectionPath}`);
  } catch (error) {
    console.error("Error adding sample measurements:", error);
    throw error;
  }
};
