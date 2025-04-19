
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { fetchLatestMeasurement } from "./measurementUtils";
import { useToast } from "@/hooks/use-toast";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";

interface UVCUpdateData {
  unitId: string;
  uvcHours: number;
  unitName: string;
  installationDate?: Date | string | null;
}

/**
 * Hook for updating UVC status and hours in Firestore
 */
export function useUVCStatusUpdate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ unitId, uvcHours, installationDate }: UVCUpdateData) => {
      try {
        // First get the current unit data
        const unitDocRef = doc(db, "units", unitId);
        const unitDoc = await getDoc(unitDocRef);
        
        if (!unitDoc.exists()) {
          throw new Error(`Unit ${unitId} not found`);
        }
        
        const unitData = unitDoc.data();
        
        // Get the latest measurement data
        const latestMeasurementData = await fetchLatestMeasurement(unitId);
        
        // Determine if we need to include measurement UVC hours
        // Only add measurement hours if we're explicitly setting a base value
        // and the unit isn't already using accumulated hours
        let totalUvcHours = uvcHours;
        let shouldSetAccumulated = true;
        
        // Determine the correct UVC status based on total hours
        const uvcStatus = determineUVCStatus(totalUvcHours);
        
        // Prepare update data
        const updateData: any = {
          uvc_hours: totalUvcHours,
          uvc_status: uvcStatus,
          is_uvc_accumulated: shouldSetAccumulated,
          last_update: new Date().toISOString()
        };
        
        // Add installation date if provided
        if (installationDate) {
          // Convert Date object to ISO string if needed
          if (installationDate instanceof Date) {
            updateData.uvc_installation_date = installationDate.toISOString();
          } else {
            updateData.uvc_installation_date = installationDate;
          }
        }
        
        // Update the Firestore document
        console.log(`Updating UVC data for unit ${unitId}:`, updateData);
        await updateDoc(unitDocRef, updateData);
        
        return { unitId, success: true };
      } catch (error) {
        console.error("Error updating UVC status:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      queryClient.invalidateQueries({ queryKey: ["unit", variables.unitId] });
      
      toast({
        title: "UVC Info Updated",
        description: `Updated UVC information for ${variables.unitName}`,
      });
    },
    onError: (error, variables) => {
      console.error("Error in UVC status update:", error);
      
      toast({
        title: "Update Failed",
        description: `Could not update UVC info for ${variables.unitName}`,
        variant: "destructive",
      });
    }
  });
}
