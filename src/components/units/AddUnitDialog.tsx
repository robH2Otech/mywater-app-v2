
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UnitFormFields } from "./UnitFormFields";
import { UnitFormActions } from "./UnitFormActions";
import { useQueryClient } from "@tanstack/react-query";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

export function AddUnitDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    total_volume: "",
    status: "active",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    next_maintenance: null as Date | null,
  });

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
      // Add unit to Firestore
      const unitsCollection = collection(db, "units");
      await addDoc(unitsCollection, {
        name: formData.name,
        location: formData.location || null,
        total_volume: parseFloat(formData.total_volume),
        status: formData.status,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        next_maintenance: formData.next_maintenance?.toISOString() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Invalidate and refetch units data
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      
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
