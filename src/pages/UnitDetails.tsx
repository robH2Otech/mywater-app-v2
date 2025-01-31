import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const UnitDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: unit, isLoading, refetch } = useQuery({
    queryKey: ["unit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch unit details",
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
  });

  const [formData, setFormData] = useState({
    name: unit?.name || "",
    location: unit?.location || "",
    total_volume: unit?.total_volume?.toString() || "",
    status: unit?.status || "active",
    contact_name: unit?.contact_name || "",
    contact_email: unit?.contact_email || "",
    contact_phone: unit?.contact_phone || "",
    next_maintenance: unit?.next_maintenance ? new Date(unit.next_maintenance) : null,
    notes: unit?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("units")
        .update({
          name: formData.name,
          location: formData.location,
          total_volume: parseFloat(formData.total_volume),
          status: formData.status,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          next_maintenance: formData.next_maintenance?.toISOString() || null,
          notes: formData.notes || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Water unit has been updated successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error updating unit:", error);
      toast({
        title: "Error",
        description: "Failed to update water unit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-[400px] bg-spotify-darker rounded-lg" />;
  }

  if (!unit) {
    return <div>Unit not found</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Water Unit</h1>
        <p className="text-gray-400">Update unit information</p>
      </div>

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
            type="submit"
            disabled={isSubmitting}
            className="bg-spotify-green hover:bg-spotify-green/90 text-white"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};