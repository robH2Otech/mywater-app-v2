import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Unit Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="MYWATER XXX"
              required
            />
            <FormInput
              label="Maintenance Contact"
              value={formData.contact_name}
              onChange={(value) => setFormData({ ...formData, contact_name: value })}
              placeholder="Enter contact name"
            />
            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
              placeholder="Enter location"
            />
            <FormInput
              label="Email"
              type="email"
              value={formData.contact_email}
              onChange={(value) => setFormData({ ...formData, contact_email: value })}
              placeholder="Enter email"
            />
            <FormInput
              label="Total Volume (m³)"
              type="number"
              value={formData.total_volume}
              onChange={(value) => setFormData({ ...formData, total_volume: value })}
              placeholder="Enter volume"
              required
            />
            <FormInput
              label="Phone"
              type="tel"
              value={formData.contact_phone}
              onChange={(value) => setFormData({ ...formData, contact_phone: value })}
              placeholder="Enter phone number"
            />
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-spotify-darker border-spotify-accent">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormDatePicker
              label="Next Maintenance"
              value={formData.next_maintenance}
              onChange={(date) => setFormData({ ...formData, next_maintenance: date })}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-spotify-green hover:bg-spotify-green/90 text-white"
            >
              Add Unit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}