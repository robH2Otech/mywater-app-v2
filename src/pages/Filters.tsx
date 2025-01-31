import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, CheckCircle2, Clock, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export const Filters = () => {
  const { toast } = useToast();

  const { data: units = [], isLoading } = useQuery({
    queryKey: ["filter-units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .order("next_maintenance", { ascending: true });
      
      if (error) {
        toast({
          title: "Error fetching units",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
  });

  const getMaintenanceStatus = (unit: any) => {
    const now = new Date();
    const nextMaintenance = unit.next_maintenance ? new Date(unit.next_maintenance) : null;
    
    if (!nextMaintenance) return "unknown";
    if (nextMaintenance < now) return "overdue";
    
    const daysUntil = Math.ceil((nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) return "soon";
    return "ok";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-spotify-darker">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-1/3 bg-spotify-accent" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-2/3 bg-spotify-accent" />
                <Skeleton className="h-4 w-1/2 bg-spotify-accent" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Filter Maintenance</h1>
        <p className="text-gray-400">Track and manage filter maintenance schedules</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit) => {
          const status = getMaintenanceStatus(unit);
          const statusColors = {
            overdue: "text-red-500",
            soon: "text-yellow-500",
            ok: "text-spotify-green",
            unknown: "text-gray-400",
          };
          
          return (
            <Card key={unit.id} className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{unit.name}</h3>
                      {unit.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                          <MapPin className="h-4 w-4" />
                          {unit.location}
                        </div>
                      )}
                    </div>
                    {status === "overdue" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    {status === "soon" && <Clock className="h-5 w-5 text-yellow-500" />}
                    {status === "ok" && <CheckCircle2 className="h-5 w-5 text-spotify-green" />}
                  </div>
                  
                  <div className="space-y-2">
                    {unit.last_maintenance && (
                      <div className="text-sm text-gray-400">
                        Last Maintenance: {new Date(unit.last_maintenance).toLocaleDateString()}
                      </div>
                    )}
                    {unit.next_maintenance && (
                      <div className={`text-sm ${statusColors[status]}`}>
                        Next Maintenance: {new Date(unit.next_maintenance).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Coming soon",
                        description: "This feature is not yet implemented.",
                      });
                    }}
                  >
                    Schedule Maintenance
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};