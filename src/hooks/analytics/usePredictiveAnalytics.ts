
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { detectAnomalies, predictMaintenance } from "@/services/predictive/predictiveService";
import { useRealtimeMeasurements } from "@/hooks/measurements/useRealtimeMeasurements";

export function usePredictiveAnalytics(unitId: string | undefined) {
  // Fetch measurements for the unit
  const { 
    measurements, 
    isLoading: isMeasurementsLoading, 
    error: measurementsError 
  } = useRealtimeMeasurements(unitId || "");
  
  // Detect anomalies
  const { data: anomalies = [], isLoading: isAnomaliesLoading } = useQuery({
    queryKey: ["anomalies", unitId, measurements?.length],
    queryFn: async () => {
      if (!unitId || !measurements || measurements.length < 5) return [];
      try {
        return await detectAnomalies(unitId, measurements);
      } catch (error) {
        console.error("Error detecting anomalies:", error);
        return [];
      }
    },
    enabled: !!unitId && !!measurements && measurements.length >= 5,
  });
  
  // Predict maintenance
  const { data: maintenancePrediction, isLoading: isPredictionLoading } = useQuery({
    queryKey: ["maintenance-prediction", unitId, measurements?.length],
    queryFn: async () => {
      if (!unitId || !measurements || measurements.length < 5) return null;
      try {
        return await predictMaintenance(unitId, measurements);
      } catch (error) {
        console.error("Error predicting maintenance:", error);
        return null;
      }
    },
    enabled: !!unitId && !!measurements && measurements.length >= 5,
  });
  
  // Calculate anomaly score based on number and severity of anomalies
  const anomalyScore = useMemo(() => {
    if (!anomalies || anomalies.length === 0) return 0;
    
    // Weight by severity
    const scoreMap = { low: 1, medium: 3, high: 5 };
    const totalScore = anomalies.reduce((sum, anomaly) => {
      return sum + (scoreMap[anomaly.severity] || 0);
    }, 0);
    
    // Normalize to 0-100 scale (max score assumes up to 20 anomalies)
    const normalizedScore = Math.min(100, (totalScore / 100) * 100);
    return Math.round(normalizedScore);
  }, [anomalies]);
  
  // Generate risk assessment
  const riskAssessment = useMemo(() => {
    if (anomalyScore >= 70) return "high";
    if (anomalyScore >= 30) return "medium";
    return "low";
  }, [anomalyScore]);
  
  return {
    measurements,
    anomalies,
    maintenancePrediction,
    anomalyScore,
    riskAssessment,
    isLoading: isMeasurementsLoading || isAnomaliesLoading || isPredictionLoading,
    error: measurementsError,
  };
}
