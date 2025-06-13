
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ProcessedMeasurement } from "./types/measurementTypes";
import { processMeasurementDocuments } from "./utils/dataProcessing";

// Re-export the getMeasurementsCollectionPath function so other modules can use it
export { getMeasurementsCollectionPath } from "./utils/collectionPaths";

async function fetchMeasurementsForUnit(unitId: string, limitCount: number = 24): Promise<ProcessedMeasurement[]> {
  console.log(`📊 Fetching measurements for unit: ${unitId}`);
  
  // Try different collection paths in order of likelihood
  const pathsToTry = [
    // Simple measurements collection (most common)
    { collection: "measurements", field: "unit_id" },
    { collection: "measurements", field: "unitId" },
    // Unit-specific subcollections
    { collection: `units/${unitId}/data`, field: null },
    { collection: `units/${unitId}/measurements`, field: null },
  ];
  
  for (const pathConfig of pathsToTry) {
    try {
      let measurementsQuery;
      
      if (pathConfig.field) {
        // Query with where clause
        measurementsQuery = query(
          collection(db, pathConfig.collection),
          where(pathConfig.field, "==", unitId),
          orderBy("timestamp", "desc"),
          limit(limitCount)
        );
      } else {
        // Direct subcollection query
        measurementsQuery = query(
          collection(db, pathConfig.collection),
          orderBy("timestamp", "desc"),
          limit(limitCount)
        );
      }
      
      console.log(`🔍 Trying path: ${pathConfig.collection} with field: ${pathConfig.field || 'direct'}`);
      const snapshot = await getDocs(measurementsQuery);
      
      if (!snapshot.empty) {
        console.log(`✅ Found ${snapshot.docs.length} measurements for ${unitId} at ${pathConfig.collection}`);
        const processedData = processMeasurementDocuments(snapshot.docs);
        
        // Ensure unitId is set correctly
        return processedData.map(measurement => ({
          ...measurement,
          unitId: unitId
        }));
      }
    } catch (error) {
      console.warn(`⚠️ Error querying ${pathConfig.collection}:`, error);
    }
  }
  
  console.log(`❌ No measurements found for unit ${unitId} in any collection`);
  return [];
}

export function useMeasurementCollection(unitId?: string | string[]) {
  const [measurements, setMeasurements] = useState<ProcessedMeasurement[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["measurements", unitId],
    queryFn: async () => {
      if (!unitId) {
        console.log("❌ No unitId provided to useMeasurementCollection");
        return [];
      }

      if (Array.isArray(unitId)) {
        console.log(`📊 Fetching measurements for ${unitId.length} units:`, unitId);
        const allMeasurements: ProcessedMeasurement[] = [];
        
        for (const id of unitId) {
          if (!id) continue;
          
          const unitMeasurements = await fetchMeasurementsForUnit(id);
          allMeasurements.push(...unitMeasurements);
        }
        
        console.log(`📊 Total measurements found across all units: ${allMeasurements.length}`);
        
        // Sort all measurements by timestamp (newest first)
        return allMeasurements.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }

      // For single unit ID
      return await fetchMeasurementsForUnit(unitId);
    },
    enabled: !!unitId,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });

  if (data && data !== measurements) {
    setMeasurements(data);
  }

  return { measurements: measurements || [], isLoading, error, refetch };
}
