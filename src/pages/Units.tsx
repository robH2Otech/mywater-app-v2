import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Plus, MapPin, Calendar, Phone, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Units = () => {
  const { toast } = useToast();
  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching units:", error);
        toast({
          title: "Error",
          description: "Failed to fetch water units",
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "limit":
        return "text-orange-500";
      default:
        return "text-spotify-green";
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Water Units</h1>
            <p className="text-gray-400">Manage and monitor your water treatment units</p>
          </div>
          <Button 
            onClick={() => {
              toast({
                title: "Coming soon",
                description: "This feature will be available soon",
              });
            }}
            className="bg-spotify-green hover:bg-spotify-green/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-spotify-darker animate-pulse">
                <CardContent className="p-6 h-48" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit) => (
              <Card 
                key={unit.id} 
                className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Droplet className={`h-5 w-5 ${getStatusColor(unit.status)}`} />
                    {unit.name}
                  </CardTitle>
                  <span className={`text-sm font-medium ${getStatusColor(unit.status)} capitalize`}>
                    {unit.status}
                  </span>
                </CardHeader>
                <CardContent className="space-y-4">
                  {unit.location && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {unit.location}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Next Maintenance: {formatDate(unit.next_maintenance)}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Last Maintenance: {formatDate(unit.last_maintenance)}
                    </div>
                  </div>

                  {(unit.contact_name || unit.contact_email || unit.contact_phone) && (
                    <div className="border-t border-gray-700 pt-3 mt-3 space-y-2">
                      {unit.contact_name && (
                        <div className="flex items-center text-gray-400 text-sm">
                          <User className="h-4 w-4 mr-2" />
                          {unit.contact_name}
                        </div>
                      )}
                      {unit.contact_email && (
                        <div className="flex items-center text-gray-400 text-sm">
                          <Mail className="h-4 w-4 mr-2" />
                          {unit.contact_email}
                        </div>
                      )}
                      {unit.contact_phone && (
                        <div className="flex items-center text-gray-400 text-sm">
                          <Phone className="h-4 w-4 mr-2" />
                          {unit.contact_phone}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};