import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CreateAlertDialog } from "@/components/alerts/CreateAlertDialog";
import { AlertDetailsDialog } from "@/components/alerts/AlertDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { AlertsList } from "@/components/alerts/AlertsList";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData, AlertData } from "@/types/analytics";

interface UnitWithAlerts extends UnitData {
  alerts: AlertData[];
}

export const Alerts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const { toast } = useToast();

  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      console.log("Fetching units data...");
      try {
        const unitsCollection = collection(db, "units");
        const unitsSnapshot = await getDocs(unitsCollection);
        const unitsData = unitsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UnitData[];
        console.log("Units data:", unitsData);
        return unitsData;
      } catch (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
    },
  });

  const { data: alerts = [], isLoading: alertsLoading, error: alertsError } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      console.log("Fetching alerts data...");
      try {
        const alertsCollection = collection(db, "alerts");
        const alertsSnapshot = await getDocs(alertsCollection);
        const alertsData = alertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AlertData[];
        console.log("Alerts data:", alertsData);
        return alertsData;
      } catch (error) {
        console.error("Error fetching alerts:", error);
        throw error;
      }
    },
  });

  const unitsWithAlerts = units.map(unit => ({
    ...unit,
    alerts: alerts.filter(alert => alert.unit_id === unit.id)
  })) as UnitWithAlerts[];

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
    <div className="space-y-6">
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
    </div>
  );
};
