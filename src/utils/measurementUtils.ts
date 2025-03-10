
import { collection, doc, addDoc, getDocs, query, orderBy, limit, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { formatInTimeZone } from 'date-fns-tz';

export interface Measurement {
  timestamp: string;
  volume: number;
  temperature: number;
  cumulative_volume: number;
}

/**
 * Add a new measurement to a water unit
 */
export const addMeasurement = async (unitId: string, volume: number, temperature: number) => {
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
      cumulative_volume: currentTotalVolume + volume
    };
    
    let measurementId;
    
    // For MYWATER_* units, use a specific document ID
    if (unitId.startsWith("MYWATER_")) {
      const specificDocRef = doc(db, `units/${unitId}/measurements`, "zRQ8NhGTAb5MD7Qw4DwA");
      await setDoc(specificDocRef, measurementData);
      measurementId = "zRQ8NhGTAb5MD7Qw4DwA";
      console.log(`Measurement updated for ${unitId} at fixed document ID`);
    } else {
      // For other units, add as a new document
      const measurementsCollectionRef = collection(db, `units/${unitId}/measurements`);
      const newMeasurementRef = await addDoc(measurementsCollectionRef, measurementData);
      measurementId = newMeasurementRef.id;
      console.log(`Measurement added with ID: ${measurementId}`);
    }
    
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
    // Special handling for MYWATER_* units
    if (unitId.startsWith("MYWATER_")) {
      const specificDocRef = doc(db, `units/${unitId}/measurements`, "zRQ8NhGTAb5MD7Qw4DwA");
      const docSnapshot = await getDoc(specificDocRef);
      
      if (docSnapshot.exists()) {
        return [{
          id: docSnapshot.id,
          ...docSnapshot.data()
        }] as (Measurement & { id: string })[];
      }
      return [];
    }
    
    // Standard handling for other units
    const measurementsCollectionRef = collection(db, `units/${unitId}/measurements`);
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
    // Special handling for MYWATER_* units
    if (unitId.startsWith("MYWATER_")) {
      const now = new Date();
      const timestamp = formatInTimeZone(now, 'Europe/Paris', "yyyy-MM-dd'T'HH:mm:ssXXX");
      
      // Create a single sample measurement
      const measurementData: Measurement = {
        timestamp,
        volume: 100,
        temperature: 22.5,
        cumulative_volume: 100
      };
      
      // Set the document with the specific ID
      const specificDocRef = doc(db, `units/${unitId}/measurements`, "zRQ8NhGTAb5MD7Qw4DwA");
      await setDoc(specificDocRef, measurementData);
      
      // Update the unit's total volume
      const unitDocRef = doc(db, "units", unitId);
      await updateDoc(unitDocRef, {
        total_volume: measurementData.cumulative_volume,
        updated_at: timestamp
      });
      
      console.log(`Sample measurement added for unit ${unitId}`);
      return;
    }
    
    // Regular handling for other units
    // Get unit's current total volume as starting point
    const unitDocRef = doc(db, "units", unitId);
    const unitDoc = await getDoc(unitDocRef);
    
    if (!unitDoc.exists()) {
      return;
    }
    
    const unitData = unitDoc.data();
    let cumulativeVolume = parseFloat(unitData.total_volume || "0");
    
    // Create sample measurements for the past 24 hours (1 per hour)
    const now = new Date();
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
      
      // Create the measurement
      const measurementData: Measurement = {
        timestamp: formattedTimestamp,
        volume: hourlyVolume,
        temperature: parseFloat(temperature),
        cumulative_volume: cumulativeVolume
      };
      
      // Add to subcollection
      const measurementsCollectionRef = collection(db, `units/${unitId}/measurements`);
      await addDoc(measurementsCollectionRef, measurementData);
    }
    
    // Update the unit's total volume to match the final cumulative value and timestamp
    await updateDoc(unitDocRef, {
      total_volume: cumulativeVolume,
      updated_at: formatInTimeZone(new Date(), 'Europe/Paris', "yyyy-MM-dd'T'HH:mm:ssXXX")
    });
    
    console.log(`Sample measurements added for unit ${unitId}`);
  } catch (error) {
    console.error("Error adding sample measurements:", error);
  }
};
