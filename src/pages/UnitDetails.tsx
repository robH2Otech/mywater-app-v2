import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { UnitFormFields } from "@/components/units/UnitFormFields";
import { UnitFormActions } from "@/components/units/UnitFormActions";
import { Card } from "@/components/ui/card";

export const UnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="bg-spotify-darker border-spotify-accent p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Edit Water Unit</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <UnitFormFields formData={formData} setFormData={setFormData} />
          <UnitFormActions 
            onCancel={() => navigate("/units")} 
            isSubmitting={isSubmitting} 
          />
        </form>
      </Card>
    </div>
  );
};