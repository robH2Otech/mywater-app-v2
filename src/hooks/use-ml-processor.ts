
import { useState } from 'react';
import { useMLOperations } from './ml/useMLOperations';
import { UnitData } from '@/types/analytics';
import { toast } from 'sonner';

export function useMLProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { processData } = useMLOperations();
  
  const processUnit = async (unit: UnitData, measurements: any[]) => {
    if (!unit || !measurements || measurements.length === 0) {
      toast.error("Cannot process: missing unit data or measurements");
      return;
    }
    
    setIsProcessing(true);
    try {
      toast.info(`Processing data for ${unit.name || 'unit'}...`);
      const result = await processData(unit, measurements);
      
      if (result.predictions.length > 0 || result.anomalies.length > 0) {
        toast.success(`Processing complete. Generated insights for ${unit.name || 'unit'}.`);
      } else {
        toast.info("Processing complete. No significant patterns found.");
      }
      return result;
    } catch (error) {
      console.error("ML processing error:", error);
      toast.error("Failed to process unit data");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    processUnit,
    isProcessing
  };
}
