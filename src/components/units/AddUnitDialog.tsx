
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UnitFormFields } from "./UnitFormFields";
import { UnitFormActions } from "./UnitFormActions";
import { useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUnitStatus, createAlertMessage } from "@/utils/unitStatusUtils";

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
    eid: "",
    iccid: "",
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
    
    if (open) {
      fetchNextUnitNumber();
    }
  }, [open]);

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
      
      // Add unit to Firestore with a custom ID
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
        eid: formData.eid || null,
        iccid: formData.iccid || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Check if an alert should be created
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

      // Invalidate and refetch units data
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["alerts"] });
      
      toast({
        title: "Success",
        description: "Water unit has been added successfully",
      });
      
      // Close dialog and reset form
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
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Add New Water Unit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <UnitFormFields formData={formData} setFormData={setFormData} />
          <UnitFormActions onCancel={() => onOpenChange(false)} isSubmitting={isSubmitting} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
