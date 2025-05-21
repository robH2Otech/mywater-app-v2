
import { onSnapshot, Query } from "firebase/firestore";
import { ProcessedMeasurement } from "./types/measurementTypes";
import { processMeasurementDocuments } from "./utils/dataProcessing";

/**
 * Sets up a realtime listener for Firestore documents
 * @deprecated Use the hooks from hooks/measurements/hooks instead
 */
export function setupRealtimeListener(
  query: Query,
  onUpdate: (measurements: ProcessedMeasurement[]) => void,
  onError: (error: Error) => void
) {
  return onSnapshot(
    query,
    (snapshot) => {
      try {
        const measurementsData = processMeasurementDocuments(snapshot.docs);
        onUpdate(measurementsData);
      } catch (err) {
        onError(err as Error);
      }
    },
    (err) => onError(err)
  );
}
