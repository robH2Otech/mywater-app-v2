import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnitFormFields } from "./UnitFormFields";
import { UnitFormActions } from "./UnitFormActions";

export function AddUnitDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
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
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("units").insert({
        name: formData.name,
        location: formData.location,
        total_volume: parseFloat(formData.total_volume),
        status: formData.status,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        next_maintenance: formData.next_maintenance ? formData.next_maintenance.toISOString() : null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Water unit has been added successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding unit:", error);
      toast({
        title: "Error",
        description: "Failed to add water unit",
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