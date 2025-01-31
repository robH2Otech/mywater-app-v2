import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Droplet } from "lucide-react";

export const Units = () => {
  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase.from("units").select("*");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Water Units</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <Card key={unit.id} className="glass hover:bg-spotify-accent/40 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{unit.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{unit.location}</p>
                    <p className={`text-sm mt-2 ${
                      unit.status === 'active' ? 'text-spotify-green' :
                      unit.status === 'warning' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                    </p>
                  </div>
                  <Droplet className="h-5 w-5 text-spotify-green" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};