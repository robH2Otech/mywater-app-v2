
import { useState } from "react";
import { UnitSelector } from "@/components/analytics/UnitSelector";
import { ReportTypeSelector } from "@/components/analytics/ReportTypeSelector";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/integrations/firebase/client";

export function Analytics() {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [reportType, setReportType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Query for fetching generated reports
  const { data: reports = [], refetch: refetchReports } = useQuery({
    queryKey: ["reports", selectedUnit],
    queryFn: async () => {
      if (!selectedUnit) return [];
      
      console.log("Fetching reports for unit:", selectedUnit);
      const reportsCollection = collection(db, "reports");
      const q = query(
        reportsCollection, 
        where("unit_id", "==", selectedUnit),
        orderBy("created_at", "desc")
      );
      
      const reportsSnapshot = await getDocs(q);
      const reportsList = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("Reports data:", reportsList);
      return reportsList;
    },
    enabled: !!selectedUnit,
  });

  const handleGenerateReport = async () => {
    if (!selectedUnit || !reportType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a unit and report type",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error("No authenticated session");
      }

      // Fetch unit data
      const unitsCollection = collection(db, "units");
      const unitQuery = query(unitsCollection, where("id", "==", selectedUnit));
      const unitSnapshot = await getDocs(unitQuery);
      
      if (unitSnapshot.empty) {
        throw new Error("Unit not found");
      }
      
      const unitData = { id: unitSnapshot.docs[0].id, ...unitSnapshot.docs[0].data() };

      // Generate report content based on unit data
      const reportContent = generateReportContent(unitData, reportType);

      // Save report to database
      const reportsCollection = collection(db, "reports");
      await addDoc(reportsCollection, {
        unit_id: selectedUnit,
        report_type: reportType,
        content: reportContent,
        generated_by: user.uid,
        created_at: new Date().toISOString()
      });

      // Refetch reports to show the new one
      await refetchReports();

      toast({
        title: "Success",
        description: `Generated ${reportType} report for ${unitData.name}`,
      });
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate report",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async (reportId: string, content: string) => {
    try {
      // Create a Blob from the content
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download report",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <UnitSelector 
          value={selectedUnit} 
          onChange={setSelectedUnit} 
        />
        
        <ReportTypeSelector 
          value={reportType} 
          onChange={setReportType} 
        />
      </div>

      <Button 
        onClick={handleGenerateReport}
        className="bg-spotify-green hover:bg-spotify-green/90"
        disabled={!selectedUnit || !reportType || isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate Report"}
      </Button>

      {reports.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">Generated Reports</h2>
          <div className="grid gap-4">
            {reports.map((report: any) => (
              <Card key={report.id} className="p-4 bg-spotify-darker">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">
                      {report.report_type} Report
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Generated on {new Date(report.created_at).toLocaleString()}
                    </p>
                    <div className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">
                      {report.content}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(report.id, report.content)}
                    className="ml-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate report content
function generateReportContent(unitData: any, reportType: string): string {
  const timestamp = new Date().toLocaleString();
  return `${reportType.toUpperCase()} REPORT
Generated: ${timestamp}

Unit Information:
Name: ${unitData.name}
Location: ${unitData.location || 'N/A'}
Status: ${unitData.status}
Total Volume: ${unitData.total_volume || 0} units

Last Maintenance: ${unitData.last_maintenance ? new Date(unitData.last_maintenance).toLocaleDateString() : 'N/A'}
Next Maintenance: ${unitData.next_maintenance ? new Date(unitData.next_maintenance).toLocaleDateString() : 'N/A'}

Contact Information:
Name: ${unitData.contact_name || 'N/A'}
Email: ${unitData.contact_email || 'N/A'}
Phone: ${unitData.contact_phone || 'N/A'}

Notes:
${unitData.notes || 'No additional notes'}`;
}
