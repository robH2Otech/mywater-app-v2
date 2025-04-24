
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProcessedMeasurement } from "./types/measurementTypes";
import { MEASUREMENT_PATHS, tryCollectionPath, getMeasurementsCollectionPath } from "./utils/collectionPaths";
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
          
          for (const pathTemplate of MEASUREMENT_PATHS) {
            try {
              const path = pathTemplate.replace('{unitId}', id);
              const snapshot = await tryCollectionPath(path);
              
              if (!snapshot.empty) {
                const data = processMeasurementDocuments(snapshot.docs);
                allMeasurements.push(...data);
                break;
              }
            } catch (err) {
              console.warn(`Error trying path for unit ${id}:`, err);
            }
          }
        }
        
        return allMeasurements.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }

      for (const pathTemplate of MEASUREMENT_PATHS) {
        try {
          const path = pathTemplate.replace('{unitId}', unitId);
          const snapshot = await tryCollectionPath(path);
          
          if (!snapshot.empty) {
            return processMeasurementDocuments(snapshot.docs);
          }
        } catch (err) {
          console.warn(`Error trying path for unit ${unitId}:`, err);
        }
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
