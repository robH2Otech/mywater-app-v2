
import { collection, doc, addDoc, getDocs, query, orderBy, limit, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { formatInTimeZone } from 'date-fns-tz';

export interface Measurement {
  timestamp: string;
  volume: number;
  temperature: number;
  cumulative_volume: number;
  uvc_hours?: number; // Add support for UVC hours tracking
}

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
    
    // Create the new measurement with UTC/GMT+1 timestamp
    const now = new Date();
    const timestamp = formatInTimeZone(now, 'Europe/Paris', "yyyy-MM-dd'T'HH:mm:ssXXX");
    
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
    await updateDoc(unitDocRef, {
      total_volume: measurementData.cumulative_volume,
      updated_at: timestamp
    });
    
    return measurementId;
  } catch (error) {
    console.error("Error adding measurement:", error);
    throw error;
  }
};

/**
 * Get the latest measurements for a water unit
 */
export const getLatestMeasurements = async (unitId: string, count: number = 10) => {
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
    let cumulativeUvcHours = 0;
    
    for (let i = 24; i >= 1; i--) {
      // Create timestamp for this measurement (i hours ago)
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
      
      // Format timestamp in UTC/GMT+1
      const formattedTimestamp = formatInTimeZone(timestamp, 'Europe/Paris', "yyyy-MM-dd'T'HH:mm:ssXXX");
      
      // Generate random volume between 80-120 m³ per hour
      const hourlyVolume = Math.floor(Math.random() * 40) + 80;
      
      // Generate random temperature between 18-25°C
      const temperature = (Math.random() * 7 + 18).toFixed(1);
      
      // Accumulate the volume
      cumulativeVolume += hourlyVolume;
      
      // Add 1 hour to UVC hours (assuming it's always on)
      // With some randomness to simulate occasional maintenance or downtime
      const uvcActiveTime = Math.random() > 0.1 ? 1 : 0.5; // 90% chance of full hour, 10% chance of half hour
      cumulativeUvcHours += uvcActiveTime;
      
      // Create the measurement
      const measurementData: Measurement = {
        timestamp: formattedTimestamp,
        volume: hourlyVolume,
        temperature: parseFloat(temperature),
        cumulative_volume: cumulativeVolume,
        uvc_hours: parseFloat(cumulativeUvcHours.toFixed(1))
      };
      
      // Add to subcollection with random document ID
      const measurementsCollectionRef = collection(db, collectionPath);
      await addDoc(measurementsCollectionRef, measurementData);
    }
    
    // Update the unit's total volume to match the final cumulative value and timestamp
    await updateDoc(unitDocRef, {
      total_volume: cumulativeVolume,
      updated_at: formatInTimeZone(new Date(), 'Europe/Paris', "yyyy-MM-dd'T'HH:mm:ssXXX")
    });
    
    console.log(`Sample measurements added for unit ${unitId} in ${collectionPath}`);
  } catch (error) {
    console.error("Error adding sample measurements:", error);
  }
};
