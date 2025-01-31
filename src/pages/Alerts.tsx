import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellRing, AlertTriangle, AlertOctagon, Plus } from "lucide-react";
import { CreateAlertDialog } from "@/components/alerts/CreateAlertDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const Alerts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "error":
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <BellRing className="h-5 w-5 text-spotify-green" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-spotify-green";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "error":
        return "Filter change needed soon. Please prepare new filter.";
      case "warning":
        return "Filter life reaching critical level. Plan maintenance.";
      case "limit":
        return "Filter approaching maintenance threshold.";
      default:
        return "System operating normally.";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Alerts</h1>
            <p className="text-gray-400">Manage and monitor system alerts</p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-spotify-green hover:bg-spotify-green/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <Card key={unit.id} className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(unit.status)}
                      <h3 className="font-semibold">{unit.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      {getStatusMessage(unit.status)}
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">
                        Date: {new Date(unit.updated_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        Filter Life: {((unit.total_volume || 0) / 100000 * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-gray-400 hover:text-white">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CreateAlertDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onCreateAlert={() => {
          toast({
            title: "Alert created",
            description: "The alert has been created successfully.",
          });
          setIsDialogOpen(false);
        }}
      />
    </Layout>
  );
};