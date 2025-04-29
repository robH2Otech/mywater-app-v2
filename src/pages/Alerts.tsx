
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { AlertsList } from "@/components/alerts/AlertsList";
import { CreateAlertDialog } from "@/components/alerts/CreateAlertDialog";
import { AlertDetailsDialog } from "@/components/alerts/AlertDetailsDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bell, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { ClientRequestsContent } from "@/components/requests/ClientRequestsContent";
import { fetchRecentRequests } from "@/services/requestService";
import { SupportRequest } from "@/types/supportRequests";

const Alerts = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("alerts");
  const [recentRequests, setRecentRequests] = useState<SupportRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const queryClient = useQueryClient();

  // Fetch recent client requests when the tab changes to "requests"
  useEffect(() => {
    if (activeTab === "requests") {
      loadRecentRequests();
    }
  }, [activeTab]);

  const loadRecentRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const requests = await fetchRecentRequests(7); // last 7 days
      setRecentRequests(requests);
    } catch (error) {
      console.error("Error loading recent requests:", error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Mock units array with alerts for display in AlertsList
  const units = [
    {
      id: "unit1",
      name: "MYWATER 001",
      location: "Paris, France",
      alerts: [
        {
          id: "alert1",
          message: "Filter replacement required",
          status: "urgent",
          created_at: new Date().toISOString()
        }
      ]
    },
    {
      id: "unit2",
      name: "MYWATER 002",
      location: "Lyon, France",
      alerts: [
        {
          id: "alert2",
          message: "Low water pressure detected",
          status: "warning",
          created_at: new Date().toISOString()
        }
      ]
    }
  ];

  const handleCreateAlert = () => {
    console.log("Creating new alert");
    // Implementation would go here
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Alerts & Notifications"
          description="Manage system alerts and client support requests"
        />
        {activeTab === "alerts" && (
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-mywater-blue hover:bg-mywater-blue/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Alert
          </Button>
        )}
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            System Alerts
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Client Requests
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="alerts">
          <Card className="p-4 bg-spotify-darker">
            <AlertsList units={units} onAlertClick={(id) => setSelectedAlertId(id)} />
          </Card>
        </TabsContent>
        
        <TabsContent value="requests">
          <ClientRequestsContent />
        </TabsContent>
      </Tabs>

      <CreateAlertDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateAlert={handleCreateAlert}
      />

      <AlertDetailsDialog
        open={!!selectedAlertId}
        onOpenChange={(open) => !open && setSelectedAlertId(null)}
        alert={selectedAlertId ? units.flatMap(u => u.alerts).find(a => a.id === selectedAlertId) : null}
      />
    </div>
  );
};

export default Alerts;
