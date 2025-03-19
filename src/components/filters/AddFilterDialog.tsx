
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FormDatePicker } from "../shared/FormDatePicker";
import { FormInput } from "../shared/FormInput";
import { useQuery } from "@tanstack/react-query";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";

export function AddFilterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    unit_id: "",
    installation_date: null as Date | null,
    last_change: null as Date | null,
    next_change: null as Date | null,
    volume_processed: "",
    contact_name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const unitsCollection = collection(db, "units");
      const unitsQuery = query(unitsCollection, orderBy("name"));
      const unitsSnapshot = await getDocs(unitsQuery);
      
      return unitsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const filtersCollection = collection(db, "filters");
      await addDoc(filtersCollection, {
        unit_id: formData.unit_id,
        installation_date: formData.installation_date?.toISOString() || null,
        last_change: formData.last_change?.toISOString() || null,
        next_change: formData.next_change?.toISOString() || null,
        volume_processed: parseFloat(formData.volume_processed) || 0,
        contact_name: formData.contact_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        notes: formData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Filter has been added successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding filter:", error);
      toast({
        title: "Error",
        description: "Failed to add filter",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] overflow-hidden bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Add New Filter</DialogTitle>
        </DialogHeader>
        
        <ScrollableDialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Water Unit</label>
                <Select
                  value={formData.unit_id}
                  onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
                >
                  <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white h-10">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-darker border-spotify-accent">
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormDatePicker
                label="Installation Date"
                value={formData.installation_date}
                onChange={(date) => setFormData({ ...formData, installation_date: date })}
              />

              <FormDatePicker
                label="Last Change"
                value={formData.last_change}
                onChange={(date) => setFormData({ ...formData, last_change: date })}
              />

              <FormDatePicker
                label="Next Change"
                value={formData.next_change}
                onChange={(date) => setFormData({ ...formData, next_change: date })}
              />

              <FormInput
                label="Volume Processed (m³)"
                type="number"
                value={formData.volume_processed}
                onChange={(value) => setFormData({ ...formData, volume_processed: value })}
                placeholder="0"
              />

              <FormInput
                label="Contact Name"
                value={formData.contact_name}
                onChange={(value) => setFormData({ ...formData, contact_name: value })}
                placeholder="Enter contact name"
              />

              <FormInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                placeholder="Enter email"
              />

              <FormInput
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional Notes"
                className="w-full h-20 px-3 py-2 bg-spotify-accent border-spotify-accent-hover text-white rounded-md resize-none"
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
                className="bg-mywater-blue hover:bg-mywater-blue/90 text-white"
              >
                Add Filter
              </Button>
            </div>
          </form>
        </ScrollableDialogContent>
      </DialogContent>
    </Dialog>
  );
}
