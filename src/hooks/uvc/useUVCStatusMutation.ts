
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for updating UVC data with synchronized status and alert generation
 */
export function useUVCStatusMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      unitId,
      uvcHours,
      unitName,
      installationDate,
    }: {
      unitId: string;
      uvcHours: number;
      unitName: string;
      installationDate?: Date;
    }) => {
      console.log(`Updating UVC hours for ${unitId} to ${uvcHours}`);
      
      // Calculate new status based on hours
      const newStatus = determineUVCStatus(uvcHours);
      
      // Prepare update data
      const updateData: any = {
        uvc_hours: uvcHours,
        uvc_status: newStatus,
        is_uvc_accumulated: true, // Mark this as using accumulated hours
        updated_at: new Date().toISOString()
      };
      
      // Add installation date if provided
      if (installationDate) {
        updateData.uvc_installation_date = installationDate.toISOString();
      }
      
      // Update the unit document
      const unitDocRef = doc(db, "units", unitId);
      await updateDoc(unitDocRef, updateData);

      // Create alert if status is warning or urgent
      if (newStatus === 'warning' || newStatus === 'urgent') {
        const alertMessage = createUVCAlertMessage(unitName, uvcHours, newStatus);
        
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: unitId,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      return { unitId, uvcHours, newStatus };
    },
    onSuccess: async ({ unitId, uvcHours }) => {
      // Invalidate all relevant queries to ensure data consistency
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["unit", unitId] });
      await queryClient.invalidateQueries({ queryKey: ["alerts"] });
      
      toast({
        title: "UVC details updated",
        description: `Updated UVC hours to ${Math.round(uvcHours).toLocaleString()}`,
      });
    },
    onError: (error) => {
      console.error("Error updating UVC details:", error);
      toast({
        title: "Error updating UVC details",
        description: "Failed to update UVC details. Please try again.",
        variant: "destructive",
      });
    }
  });
}
