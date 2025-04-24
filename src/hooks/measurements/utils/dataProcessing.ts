
import { ProcessedMeasurement, RawMeasurement } from "../types/measurementTypes";
import { Timestamp } from "firebase/firestore";

export function processMeasurementDocuments(measurementDocs: any[]): ProcessedMeasurement[] {
  return measurementDocs.map(doc => {
    const data = doc.data() as RawMeasurement;
    let timestamp = data.timestamp;
    let rawTimestamp = null;

    // Handle various timestamp formats
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      rawTimestamp = timestamp as Timestamp;
      timestamp = rawTimestamp.toDate().toISOString();
    } else if (timestamp instanceof Date) {
      rawTimestamp = Timestamp.fromDate(timestamp);
      timestamp = timestamp.toISOString();
    } else if (typeof timestamp === 'string') {
      // If it's already a string format, try to parse it as a date for consistent output
      try {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          timestamp = date.toISOString();
          rawTimestamp = Timestamp.fromDate(date);
        }
      } catch (e) {
        console.warn("Failed to parse timestamp string:", timestamp);
      }
    }

    const unitId = data.unitId || doc.ref?.path?.split('/')[1] || '';
    const pathParts = doc.ref?.path?.split('/') || [];
    const collectionName = pathParts.length >= 2 ? pathParts[0] : '';
    
    // Handle various volume fields and formats
    let volume = 0;
    if (typeof data.volume === 'number') {
      volume = data.volume;
    } else if (typeof data.volume === 'string') {
      volume = parseFloat(data.volume) || 0;
    } else if (typeof data.value === 'number') {
      volume = data.value;
    }
    
    // Handle temperature with various formats
    let temperature = 0;
    if (typeof data.temperature === 'number') {
      temperature = data.temperature;
    } else if (typeof data.temperature === 'string') {
      temperature = parseFloat(data.temperature) || 0;
    } else if (typeof data.temp === 'number') {
      temperature = data.temp;
    }
    
    // Handle UVC hours with various formats
    let uvc_hours = 0;
    if (typeof data.uvc_hours === 'number') {
      uvc_hours = data.uvc_hours;
    } else if (typeof data.uvc_hours === 'string') {
      uvc_hours = parseFloat(data.uvc_hours) || 0;
    } else if (typeof data.uvc === 'number') {
      uvc_hours = data.uvc;
    }
    
    // Determine cumulative volume - use provided value or fall back to volume
    let cumulative_volume = typeof data.cumulative_volume === 'number' ? data.cumulative_volume : volume;
    if (typeof data.cumulative_volume === 'string') {
      cumulative_volume = parseFloat(data.cumulative_volume) || volume;
    } else if (typeof data.total_volume === 'number') {
      cumulative_volume = data.total_volume;
    } else if (typeof data.total_volume === 'string') {
      cumulative_volume = parseFloat(data.total_volume) || volume;
    }

    return {
      id: doc.id,
      timestamp: typeof timestamp === 'string' ? timestamp : new Date().toISOString(),
      rawTimestamp,
      volume,
      temperature,
      uvc_hours,
      cumulative_volume,
      unitId
    };
  });
}
