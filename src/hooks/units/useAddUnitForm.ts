
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { getNextUnitNumber, prepareUnitData, getDefaultFormData } from "./unitFormUtils";
import { createUnitAlert, createUVCAlert } from "./unitAlertUtils";
import { UnitFormData } from "./unitFormTypes";

export function useAddUnitForm(onClose: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextUnitNumber, setNextUnitNumber] = useState(1);
  const [formData, setFormData] = useState<UnitFormData>(getDefaultFormData(1));

  // Fetch the highest unit number on load
  useEffect(() => {
    const fetchNextUnitNumber = async () => {
      const nextNumber = await getNextUnitNumber();
      setNextUnitNumber(nextNumber);
      // Pre-fill the name field with the next MYWATER unit number
      setFormData(getDefaultFormData(nextNumber));
    };
    
    fetchNextUnitNumber();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.total_volume) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare unit data using utility function
      const { unitData, customId, status } = prepareUnitData(formData, nextUnitNumber);
      
      // Add unit to Firestore with a custom ID
      const unitDocRef = doc(db, "units", customId);
      await setDoc(unitDocRef, unitData);

      // Create volume-based alert if needed
      await createUnitAlert(customId, formData.name, parseFloat(formData.total_volume), status);

      // Create UVC-specific alert if needed (only for UVC units)
      if (formData.unit_type === 'uvc' && formData.uvc_hours) {
        const uvcHours = parseFloat(formData.uvc_hours);
        const uvcStatus = unitData.uvc_status;
        
        if (uvcHours > 0 && (uvcStatus === 'warning' || uvcStatus === 'urgent')) {
          await createUVCAlert(customId, formData.name, uvcHours, uvcStatus);
        }
      }

      // Invalidate and refetch units data
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      
      // Only invalidate UVC queries for UVC units
      if (formData.unit_type === 'uvc') {
        await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      }
      
      await queryClient.invalidateQueries({ queryKey: ["alerts"] });
      
      toast({
        title: "Success",
        description: `Water ${formData.unit_type.toUpperCase()} ${formData.unit_type === 'drop' ? 'filter' : 'unit'} has been added successfully`,
      });
      
      // Close dialog and reset form
      onClose();
      setFormData(getDefaultFormData(nextUnitNumber + 1));
    } catch (error) {
      console.error("Error adding unit:", error);
      toast({
        title: "Error",
        description: "Failed to add water unit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit
  };
}
