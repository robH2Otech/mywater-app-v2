
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ReportGenerationForm } from "@/components/analytics/ReportGenerationForm";
import { ReportsList } from "@/components/analytics/ReportsList";
import { PredictiveMaintenanceDashboard } from "@/components/analytics/predictive/PredictiveMaintenanceDashboard";
import { useLocation, useNavigate } from "react-router-dom";
import { useReports } from "@/hooks/useReports";
import { toast } from "sonner";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState<"reports" | "predictive">("reports");
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedUnit, setSelectedUnit] = useState("");
  const { reports, isLoading, refetch } = useReports(selectedUnit);
  
  // Check URL for tab parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'predictive') {
      setActiveTab('predictive');
    } else if (tabParam === 'reports') {
      setActiveTab('reports');
    }
  }, [location.search]);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const newTab = value as "reports" | "predictive";
    setActiveTab(newTab);
    
    // Update URL without full page reload
    const params = new URLSearchParams(location.search);
    params.set('tab', newTab);
    navigate(`/analytics?${params.toString()}`, { replace: true });
  };
  
  const handleUnitChange = (unitId: string) => {
    setSelectedUnit(unitId);
  };

  const handleReportGenerated = () => {
    refetch();
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      await deleteDoc(reportRef);
      refetch();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };
  
  return (
    <div className="container mx-auto p-3 md:p-6 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Generate reports and analyze water system performance</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 bg-spotify-darker">
          <TabsTrigger value="reports">Reports & Analysis</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Maintenance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="focus-visible:outline-none focus-visible:ring-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <Card className="bg-spotify-darker p-4 md:p-6 border-spotify-accent/20">
                <h2 className="text-xl font-semibold mb-4">Generate Report</h2>
                <ReportGenerationForm 
                  selectedUnit={selectedUnit}
                  onUnitChange={handleUnitChange}
                  onReportGenerated={handleReportGenerated}
                />
              </Card>
            </div>
            
            <div className="lg:col-span-7">
              <Card className="bg-spotify-darker p-4 md:p-6 border-spotify-accent/20">
                <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
                <ReportsList 
                  reports={reports}
                  onDeleteReport={handleDeleteReport}
                />
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="predictive" className="focus-visible:outline-none focus-visible:ring-0">
          <div className="bg-gradient-to-br from-violet-900/20 to-indigo-900/20 border-indigo-600/30 rounded-xl p-4 shadow-xl">
            <PredictiveMaintenanceDashboard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
