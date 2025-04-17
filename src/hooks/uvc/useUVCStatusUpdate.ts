
import { useMutation } from "@tanstack/react-query";
import { collection, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";

interface UVCStatusUpdateProps {
  unitId: string;
  status: "active" | "warning" | "urgent";
}

/**
 * Hook for updating UVC status for a unit
 */
export function useUVCStatusUpdate() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ unitId, status }: UVCStatusUpdateProps) => {
      console.log(`Updating UVC status for unit ${unitId} to ${status}`);
      
      try {
        // Reference to the specific unit document
        const unitRef = doc(collection(db, "units"), unitId);
        
        // Get current data first
        const unitSnap = await getDoc(unitRef);
        
        if (!unitSnap.exists()) {
          throw new Error(`Unit with ID ${unitId} not found`);
        }
        
        // Update the UVC status
        await updateDoc(unitRef, {
          uvc_status: status,
          updated_at: new Date()
        });
        
        console.log(`UVC status updated to ${status} for unit ${unitId}`);
        
        return {
          success: true,
          unitId,
          status
        };
      } catch (error) {
        console.error(`Error updating UVC status for unit ${unitId}:`, error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description: `UVC status for unit ${data.unitId} is now ${data.status}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Could not update UVC status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });
}
