
import { useEffect, useCallback } from "react";
import { useUnits } from "@/hooks/useUnits";
import { useMLOperations } from "@/hooks/ml/useMLOperations";
import { useRealtimeMeasurements } from "@/hooks/measurements/useRealtimeMeasurements";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to process ML operations periodically for all units
 */
export function useMLProcessor() {
  const { toast } = useToast();
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  const { processUnitMeasurements, generatePredictions, isLoading: mlLoading } = useMLOperations();
  
  const processSingleUnit = useCallback(async (unitId: string) => {
    try {
      // Find unit data
      const unit = units.find(u => u.id === unitId);
      if (!unit) return;
      
      // Get measurements for the unit
      const { measurements, isLoading } = useRealtimeMeasurements(unitId);
      if (isLoading || measurements.length < 10) return;
      
      // Process for anomalies
      await processUnitMeasurements(unitId, unit.name, measurements);
      
      // Generate maintenance predictions
      await generatePredictions(unit, measurements);
      
      console.log(`ML processing completed for unit ${unitId}`);
    } catch (error) {
      console.error(`Error processing ML for unit ${unitId}:`, error);
    }
  }, [units, processUnitMeasurements, generatePredictions]);
  
  // Initialize and run periodic ML processing
  useEffect(() => {
    let processingActive = true;
    
    const runMLProcessing = async () => {
      if (unitsLoading || mlLoading || units.length === 0) return;
      
      try {
        // Process units in sequence to avoid overloading
        for (const unit of units.slice(0, 10)) { // Limit to first 10 units
          if (!processingActive) break;
          await processSingleUnit(unit.id);
        }
        
        console.log("ML batch processing completed");
        // No toast needed for background processing
      } catch (error) {
        console.error("Error during ML batch processing:", error);
        toast({
          title: "ML Processing Error",
          description: "There was an error during ML data processing",
          variant: "destructive",
        });
      }
    };
    
    // Initial run with delay
    const initialTimer = setTimeout(() => {
      runMLProcessing();
    }, 5000);
    
    // Periodic runs every 12 hours
    const intervalTimer = setInterval(() => {
      runMLProcessing();
    }, 12 * 60 * 60 * 1000);
    
    return () => {
      processingActive = false;
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [units, unitsLoading, mlLoading, processSingleUnit, toast]);
  
  return null; // This hook doesn't need to return anything
}
