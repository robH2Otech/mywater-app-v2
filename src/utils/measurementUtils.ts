
import { collection, doc, addDoc, getDocs, query, orderBy, limit, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

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
    
    // Create the new measurement
    const measurementData: Measurement = {
      timestamp: new Date().toISOString(),
      volume,
      temperature,
      cumulative_volume: currentTotalVolume + volume
    };
    
    // Add the measurement to the subcollection
    const measurementsCollectionRef = collection(db, `units/${unitId}/measurements`);
    const newMeasurementRef = await addDoc(measurementsCollectionRef, measurementData);
    
    // Update the unit's total_volume with the new cumulative value
    await updateDoc(unitDocRef, {
      total_volume: measurementData.cumulative_volume,
      updated_at: new Date().toISOString()
    });
    
    console.log(`Measurement added with ID: ${newMeasurementRef.id}`);
    return newMeasurementRef.id;
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
      
      // Generate random volume between 80-120 m³ per hour
      const hourlyVolume = Math.floor(Math.random() * 40) + 80;
      
      // Generate random temperature between 18-25°C
      const temperature = (Math.random() * 7 + 18).toFixed(1);
      
      // Accumulate the volume
      cumulativeVolume += hourlyVolume;
      
      // Create the measurement
      const measurementData: Measurement = {
        timestamp: timestamp.toISOString(),
        volume: hourlyVolume,
        temperature: parseFloat(temperature),
        cumulative_volume: cumulativeVolume
      };
      
      // Add to subcollection
      const measurementsCollectionRef = collection(db, `units/${unitId}/measurements`);
      await addDoc(measurementsCollectionRef, measurementData);
    }
    
    // Update the unit's total volume to match the final cumulative value
    await updateDoc(unitDocRef, {
      total_volume: cumulativeVolume,
      updated_at: new Date().toISOString()
    });
    
    console.log(`Sample measurements added for unit ${unitId}`);
  } catch (error) {
    console.error("Error adding sample measurements:", error);
  }
};
