
import { ProcessedMeasurement, RawMeasurement } from "../types/measurementTypes";
import { Timestamp } from "firebase/firestore";

export function processMeasurementDocuments(measurementDocs: any[]): ProcessedMeasurement[] {
  return measurementDocs.map(doc => {
    const data = doc.data() as RawMeasurement;
    let timestamp = data.timestamp;
    let rawTimestamp = null;

    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      rawTimestamp = timestamp as Timestamp;
      timestamp = rawTimestamp.toDate().toISOString();
    } else if (timestamp instanceof Date) {
      rawTimestamp = Timestamp.fromDate(timestamp);
      timestamp = timestamp.toISOString();
    }

    const unitId = data.unitId || doc.ref?.path?.split('/')[1] || '';

    return {
      id: doc.id,
      timestamp: typeof timestamp === 'string' ? timestamp : new Date().toISOString(),
      rawTimestamp,
      volume: typeof data.volume === 'number' ? data.volume : 0,
      temperature: typeof data.temperature === 'number' ? data.temperature : 0,
      uvc_hours: typeof data.uvc_hours === 'number' ? data.uvc_hours : 0,
      cumulative_volume: typeof data.cumulative_volume === 'number' ? data.cumulative_volume : data.volume || 0,
      unitId
    };
  });
}
