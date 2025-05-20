
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AnomalyDetection, MaintenancePrediction } from "@/types/ml";

/**
 * Hook to fetch ML data for a specific unit
 */
export function useUnitMLData(unitId: string | undefined) {
  // Fetch anomalies for this unit
  const { data: anomalies = [], isLoading: anomaliesLoading } = useQuery({
    queryKey: ["unit-anomalies", unitId],
    queryFn: async () => {
      if (!unitId) return [];
      
      try {
        const anomaliesCollection = collection(db, "anomaly_detections");
        const anomaliesQuery = query(
          anomaliesCollection,
          where("unitId", "==", unitId),
          where("status", "in", ["new", "reviewing", "confirmed"]),
          orderBy("detectionDate", "desc")
        );
        
        const anomaliesSnapshot = await getDocs(anomaliesQuery);
        
        return anomaliesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AnomalyDetection[];
      } catch (error) {
        console.error(`Error fetching anomalies for unit ${unitId}:`, error);
        return [];
      }
    },
    enabled: !!unitId
  });
  
  // Fetch maintenance predictions for this unit
  const { data: predictions = [], isLoading: predictionsLoading } = useQuery({
    queryKey: ["unit-predictions", unitId],
    queryFn: async () => {
      if (!unitId) return [];
      
      try {
        const predictionsCollection = collection(db, "maintenance_predictions");
        const predictionsQuery = query(
          predictionsCollection,
          where("unitId", "==", unitId),
          where("status", "in", ["predicted", "scheduled"]),
          orderBy("predictedDate", "asc")
        );
        
        const predictionsSnapshot = await getDocs(predictionsQuery);
        
        return predictionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MaintenancePrediction[];
      } catch (error) {
        console.error(`Error fetching predictions for unit ${unitId}:`, error);
        return [];
      }
    },
    enabled: !!unitId
  });
  
  return {
    anomalies,
    predictions,
    isLoading: anomaliesLoading || predictionsLoading,
    hasMLData: anomalies.length > 0 || predictions.length > 0
  };
}
