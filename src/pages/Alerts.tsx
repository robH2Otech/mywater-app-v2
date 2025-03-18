
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
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";

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
        const unitsData = unitsSnapshot.docs.map(doc => {
          const data = doc.data();
          // Calculate the correct status based on volume
          const calculatedStatus = determineUnitStatus(data.total_volume);
          
          return {
            id: doc.id,
            ...data,
            // Override with calculated status
            status: calculatedStatus
          };
        }) as UnitData[];
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

  if (unitsError || alertsError) {
    console.error("Error in Alerts component:", unitsError || alertsError);
    toast({
      title: "Error loading alerts",
      description: "There was a problem loading the alerts. Please try again.",
      variant: "destructive",
    });
    return <div>Error loading alerts. Please try again.</div>;
  }

  if (unitsLoading || alertsLoading) {
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
      
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Alerts Section */}
        <div className="w-full">
          <RecentAlerts />
        </div>

        {/* All Alerts List */}
        <div className="bg-spotify-darker rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">All Alerts</h2>
          <AlertsList
            units={unitsWithAlerts}
            onAlertClick={setSelectedAlert}
          />
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

      <AlertDetailsDialog
        open={!!selectedAlert}
        onOpenChange={(open) => !open && setSelectedAlert(null)}
        alert={selectedAlert}
      />
    </div>
  );
};
