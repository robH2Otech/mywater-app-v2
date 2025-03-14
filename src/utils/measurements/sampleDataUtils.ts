
import { collection, doc, addDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Measurement } from './types';
import { formatTimestamp } from './formatUtils';

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
