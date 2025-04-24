
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProcessedMeasurement } from "./types/measurementTypes";
import { MEASUREMENT_PATHS, getMeasurementsCollectionPath, tryCollectionPath, tryAllMeasurementPaths } from "./utils/collectionPaths";
import { processMeasurementDocuments } from "./utils/dataProcessing";

// Re-export the getMeasurementsCollectionPath function so other modules can use it
export { getMeasurementsCollectionPath } from "./utils/collectionPaths";

export function useMeasurementCollection(unitId?: string | string[]) {
  const [measurements, setMeasurements] = useState<ProcessedMeasurement[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["measurements", unitId],
    queryFn: async () => {
      if (!unitId) return [];

      if (Array.isArray(unitId)) {
        const allMeasurements: ProcessedMeasurement[] = [];
        
        for (const id of unitId) {
          if (!id) continue;
          
          try {
            // Use improved path handling function
            const snapshot = await tryAllMeasurementPaths(id);
            if (snapshot && !snapshot.empty) {
              const data = processMeasurementDocuments(snapshot.docs);
              allMeasurements.push(...data);
            } else {
              console.log(`No measurements found for unit ${id} in any collection path`);
            }
          } catch (err) {
            console.warn(`Error fetching measurements for unit ${id}:`, err);
          }
        }
        
        return allMeasurements.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }

      // For single unit ID
      try {
        const snapshot = await tryAllMeasurementPaths(unitId);
        if (snapshot && !snapshot.empty) {
          return processMeasurementDocuments(snapshot.docs);
        } else {
          console.log(`No measurements found for unit ${unitId} in any collection path`);
        }
      } catch (err) {
        console.warn(`Error fetching measurements for unit ${unitId}:`, err);
      }
      
      return [];
    },
    enabled: !!unitId,
    staleTime: 60000,
  });

  if (data && data !== measurements) {
    setMeasurements(data);
  }

  return { measurements: measurements || [], isLoading, error, refetch };
}
