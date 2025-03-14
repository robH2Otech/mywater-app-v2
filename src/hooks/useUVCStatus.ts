
import { useUVCStatusMonitoring } from "./uvc/useUVCStatusMonitoring";
import { useUVCStatusUpdate } from "./uvc/useUVCStatusUpdate";

/**
 * Main hook for UVC status management
 * This is now a lightweight wrapper around specialized hooks
 */
export function useUVCStatus(units: any[]) {
  const { processedUnits } = useUVCStatusMonitoring(units);
  const { updateUVCStatus } = useUVCStatusUpdate();

  return { 
    processedUnits,
    updateUVCStatus 
  };
}
