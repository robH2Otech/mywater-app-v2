
import { useMutation } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for updating UVC status in the database
 */
export function useUVCStatusUpdate() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      unitId, 
      uvcHours, 
      isAccumulated = true 
    }: { 
      unitId: string; 
      uvcHours: number; 
      isAccumulated?: boolean;
    }) => {
      console.log(`Updating UVC status for unit ${unitId}: ${uvcHours} hours (accumulated: ${isAccumulated})`);
      
      // Calculate new status based on hours
      const uvcStatus = determineUVCStatus(uvcHours);
      
      // Update the unit document
      const unitDocRef = doc(db, "units", unitId);
      await updateDoc(unitDocRef, {
        uvc_hours: uvcHours,
        uvc_status: uvcStatus,
        is_uvc_accumulated: isAccumulated,
        updated_at: new Date().toISOString()
      });
      
      return { unitId, uvcHours, uvcStatus };
    },
    onSuccess: ({ unitId, uvcHours }) => {
      toast({
        title: "UVC status updated",
        description: `Updated UVC hours to ${uvcHours.toFixed(1)} for unit ${unitId}`,
      });
    },
    onError: (error) => {
      console.error("Error updating UVC status:", error);
      toast({
        title: "Failed to update UVC status",
        description: "An error occurred while updating UVC status",
        variant: "destructive",
      });
    }
  });
}
