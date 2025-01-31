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

  const { data: units = [], isLoading } = useQuery({
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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Alerts"
          description="Manage and monitor system alerts"
          onAddClick={() => setIsDialogOpen(true)}
          addButtonText="New Alert"
        />
        
        <AlertsList
          units={units}
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
      </div>
    </Layout>
  );
};