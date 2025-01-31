import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export const Alerts = () => {
  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("status", "error");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Active Alerts</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <Card key={unit.id} className="glass hover:bg-spotify-accent/40 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{unit.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{unit.location}</p>
                    <p className="text-sm text-red-500 mt-2">Maintenance Required</p>
                  </div>
                  <Bell className="h-5 w-5 text-red-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};