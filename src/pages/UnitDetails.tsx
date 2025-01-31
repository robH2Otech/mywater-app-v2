import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const UnitDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: unit, isLoading } = useQuery({
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

  if (isLoading) {
    return <div className="animate-pulse h-[400px] bg-spotify-darker rounded-lg" />;
  }

  if (!unit) {
    return <div>Unit not found</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white">{unit.name}</h1>
        <p className="text-gray-400">Unit Details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-spotify-darker">
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Location</p>
              <p className="text-lg">{unit.location || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-lg capitalize">{unit.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Volume</p>
              <p className="text-lg">{unit.total_volume ? `${unit.total_volume} m³` : "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-spotify-darker">
          <CardHeader>
            <CardTitle>Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Last Maintenance</p>
              <p className="text-lg">
                {unit.last_maintenance 
                  ? new Date(unit.last_maintenance).toLocaleDateString()
                  : "Not available"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Next Maintenance</p>
              <p className="text-lg">
                {unit.next_maintenance
                  ? new Date(unit.next_maintenance).toLocaleDateString()
                  : "Not scheduled"}
              </p>
            </div>
          </CardContent>
        </Card>

        {(unit.contact_name || unit.contact_email || unit.contact_phone) && (
          <Card className="bg-spotify-darker">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {unit.contact_name && (
                <div>
                  <p className="text-sm text-gray-400">Contact Name</p>
                  <p className="text-lg">{unit.contact_name}</p>
                </div>
              )}
              {unit.contact_email && (
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-lg">{unit.contact_email}</p>
                </div>
              )}
              {unit.contact_phone && (
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-lg">{unit.contact_phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};