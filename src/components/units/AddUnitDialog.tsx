
import { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UnitFormFields } from "./UnitFormFields";
import { UnitFormActions } from "./UnitFormActions";
import { useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUnitStatus, createAlertMessage } from "@/utils/unitStatusUtils";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";

export function AddUnitDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextUnitNumber, setNextUnitNumber] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    total_volume: "",
    status: "active",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    next_maintenance: null as Date | null,
    setup_date: null as Date | null,
    uvc_hours: "",
    eid: "",
    iccid: "",
  });

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
        setFormData(prev => ({
          ...prev,
          name: `MYWATER ${String(highestNumber + 1).padStart(3, '0')}`
        }));
      } catch (error) {
        console.error("Error fetching next unit number:", error);
      }
    };
    
    if (open) {
      fetchNextUnitNumber();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const numericVolume = parseFloat(formData.total_volume);
      
      const status = determineUnitStatus(numericVolume);
      
      const formattedNumber = String(nextUnitNumber).padStart(3, '0');
      const customId = `MYWATER_${formattedNumber}`;
      
      const uvcHours = formData.uvc_hours ? parseFloat(formData.uvc_hours) : 0;
      const uvcStatus = determineUVCStatus(uvcHours);
      
      const unitDocRef = doc(db, "units", customId);
      await setDoc(unitDocRef, {
        name: formData.name,
        location: formData.location || null,
        total_volume: numericVolume,
        status: status,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        next_maintenance: formData.next_maintenance?.toISOString() || null,
        setup_date: formData.setup_date?.toISOString() || null,
        uvc_hours: uvcHours,
        uvc_status: uvcStatus,
        uvc_installation_date: formData.setup_date?.toISOString() || null,
        eid: formData.eid || null,
        iccid: formData.iccid || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (status === 'warning' || status === 'urgent') {
        const alertMessage = createAlertMessage(formData.name, numericVolume, status);
        
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: customId,
          message: alertMessage,
          status: status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      if (uvcHours > 0 && (uvcStatus === 'warning' || uvcStatus === 'urgent')) {
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

      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await queryClient.invalidateQueries({ queryKey: ["alerts"] });
      
      toast({
        title: "Success",
        description: "Water unit has been added successfully",
      });
      
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Add New Water Unit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <UnitFormFields formData={formData} setFormData={setFormData} />
          <UnitFormActions onCancel={() => onOpenChange(false)} isSubmitting={isSubmitting} />
        </form>
      </ScrollableDialogContent>
    </Dialog>
  );
}
