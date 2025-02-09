
import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CreateAlertDialog } from "@/components/alerts/CreateAlertDialog";
import { AlertDetailsDialog } from "@/components/alerts/AlertDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { AlertsList } from "@/components/alerts/AlertsList";

export const Alerts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const { toast } = useToast();

  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      console.log("Fetching units data...");
      const { data, error } = await supabase
        .from("units")
        .select("*");
      
      if (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
      console.log("Units data:", data);
      return data;
    },
  });

  const { data: alerts = [], isLoading: alertsLoading, error: alertsError } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      console.log("Fetching alerts data...");
      const { data, error } = await supabase
        .from("alerts")
        .select("*");
      
      if (error) {
        console.error("Error fetching alerts:", error);
        throw error;
      }
      console.log("Alerts data:", data);
      return data;
    },
  });

  const unitsWithAlerts = units.map(unit => ({
    ...unit,
    alerts: alerts.filter(alert => alert.unit_id === unit.id)
  }));

  const isLoading = unitsLoading || alertsLoading;
  const error = unitsError || alertsError;

  if (error) {
    console.error("Error in Alerts component:", error);
    toast({
      title: "Error loading alerts",
      description: "There was a problem loading the alerts. Please try again.",
      variant: "destructive",
    });
    return <div>Error loading alerts. Please try again.</div>;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Layout>
      <PageHeader
        title="Alerts"
        description="Manage and monitor system alerts"
        onAddClick={() => setIsDialogOpen(true)}
        addButtonText="New Alert"
      />
      
      <AlertsList
        units={unitsWithAlerts}
        onAlertClick={setSelectedAlert}
      />

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

      <AlertDetailsDialog
        open={!!selectedAlert}
        onOpenChange={(open) => !open && setSelectedAlert(null)}
        alert={selectedAlert}
      />
    </Layout>
  );
};
