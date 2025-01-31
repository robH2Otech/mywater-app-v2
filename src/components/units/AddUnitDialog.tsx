import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
    last_maintenance: null as Date | null,
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
        last_maintenance: formData.last_maintenance ? formData.last_maintenance.toISOString() : null,
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
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Unit Name</label>
              <Input
                placeholder="MYWATER XXX"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-spotify-accent border-spotify-accent-hover text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Maintenance Contact</label>
              <Input
                placeholder="Enter contact name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="bg-spotify-accent border-spotify-accent-hover text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Location</label>
              <Input
                placeholder="Enter location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-spotify-accent border-spotify-accent-hover text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Email</label>
              <Input
                type="email"
                placeholder="Enter email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="bg-spotify-accent border-spotify-accent-hover text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Total Volume (m³)</label>
              <Input
                type="number"
                placeholder="Enter volume"
                value={formData.total_volume}
                onChange={(e) => setFormData({ ...formData, total_volume: e.target.value })}
                className="bg-spotify-accent border-spotify-accent-hover text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Phone</label>
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="bg-spotify-accent border-spotify-accent-hover text-white"
              />
            </div>
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
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Last Maintenance</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-spotify-accent border-spotify-accent-hover text-white",
                      !formData.last_maintenance && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.last_maintenance ? (
                      format(formData.last_maintenance, "PPP")
                    ) : (
                      "Pick a date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-spotify-darker border-spotify-accent">
                  <Calendar
                    mode="single"
                    selected={formData.last_maintenance}
                    onSelect={(date) => setFormData({ ...formData, last_maintenance: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Next Maintenance</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-spotify-accent border-spotify-accent-hover text-white",
                      !formData.next_maintenance && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.next_maintenance ? (
                      format(formData.next_maintenance, "PPP")
                    ) : (
                      "Pick a date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-spotify-darker border-spotify-accent">
                  <Calendar
                    mode="single"
                    selected={formData.next_maintenance}
                    onSelect={(date) => setFormData({ ...formData, next_maintenance: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
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