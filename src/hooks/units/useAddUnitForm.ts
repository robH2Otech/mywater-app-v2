
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUnitStatus, createAlertMessage } from "@/utils/unitStatusUtils";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";

interface UnitFormData {
  name: string;
  location: string;
  total_volume: string;
  status: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  next_maintenance: Date | null;
  setup_date: Date | null;
  uvc_hours: string;
  eid: string;
  iccid: string;
  unit_type: string;
}

export function useAddUnitForm(onClose: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextUnitNumber, setNextUnitNumber] = useState(1);
  const [formData, setFormData] = useState<UnitFormData>({
    name: "",
    location: "",
    total_volume: "",
    status: "active",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    next_maintenance: null,
    setup_date: null,
    uvc_hours: "",
    eid: "",
    iccid: "",
    unit_type: "uvc", // Default to UVC unit
  });

  // Fetch the highest unit number on load
  useEffect(() => {
    const fetchNextUnitNumber = async () => {
      try {
        const unitsCollection = collection(db, "units");
        const unitsSnapshot = await getDocs(unitsCollection);
        
        let highestNumber = 0;
        
        unitsSnapshot.forEach(docSnapshot => {
          const unitName = docSnapshot.data().name || "";
          if (unitName.startsWith("MYWATER ")) {
            const numberPart = unitName.replace("MYWATER ", "");
            const number = parseInt(numberPart, 10);
            if (!isNaN(number) && number > highestNumber) {
              highestNumber = number;
            }
          }
        });
        
        setNextUnitNumber(highestNumber + 1);
        // Pre-fill the name field with the next MYWATER unit number
        setFormData(prev => ({
          ...prev,
          name: `MYWATER ${String(highestNumber + 1).padStart(3, '0')}`
        }));
      } catch (error) {
        console.error("Error fetching next unit number:", error);
      }
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
      // Parse volume to numeric value
      const numericVolume = parseFloat(formData.total_volume);
      
      // Determine the status based on the volume
      const status = determineUnitStatus(numericVolume);
      
      // Create a custom ID in the format MYWATER_XXX
      const formattedNumber = String(nextUnitNumber).padStart(3, '0');
      const customId = `MYWATER_${formattedNumber}`;
      
      // Process UVC hours if the unit is a UVC type
      let uvcHours = 0;
      let uvcStatus = null;
      
      if (formData.unit_type === 'uvc' && formData.uvc_hours) {
        uvcHours = parseFloat(formData.uvc_hours);
        uvcStatus = determineUVCStatus(uvcHours);
      }
      
      // Prepare base unit data
      const unitData: any = {
        name: formData.name,
        location: formData.location || null,
        total_volume: numericVolume,
        status: status,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        next_maintenance: formData.next_maintenance?.toISOString() || null,
        setup_date: formData.setup_date?.toISOString() || null,
        eid: formData.eid || null,
        iccid: formData.iccid || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unit_type: formData.unit_type,
      };

      // Add UVC-specific data if UVC unit type
      if (formData.unit_type === 'uvc') {
        unitData.uvc_hours = uvcHours;
        unitData.uvc_status = uvcStatus;
        unitData.uvc_installation_date = formData.setup_date?.toISOString() || null;
      }

      // Add unit to Firestore with a custom ID
      const unitDocRef = doc(db, "units", customId);
      await setDoc(unitDocRef, unitData);

      // Check if an alert should be created for unit status
      if (status === 'warning' || status === 'urgent') {
        const alertMessage = createAlertMessage(formData.name, numericVolume, status);
        
        // Add a new alert to the alerts collection
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: customId,
          message: alertMessage,
          status: status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Check if UVC alert should be created for UVC units
      if (formData.unit_type === 'uvc' && uvcHours > 0 && (uvcStatus === 'warning' || uvcStatus === 'urgent')) {
        const uvcAlertMessage = createUVCAlertMessage(formData.name, uvcHours, uvcStatus);
        
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: customId,
          message: uvcAlertMessage,
          status: uvcStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
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
        description: `Water ${formData.unit_type.toUpperCase()} unit has been added successfully`,
      });
      
      // Close dialog and reset form
      onClose();
      setFormData({
        name: "",
        location: "",
        total_volume: "",
        status: "active",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        next_maintenance: null,
        setup_date: null,
        uvc_hours: "",
        eid: "",
        iccid: "",
        unit_type: "uvc",
      });
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
