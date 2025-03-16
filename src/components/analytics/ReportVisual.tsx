
import { UnitData } from "@/types/analytics";
import { ReportChart } from "./ReportChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { format } from "date-fns";
import { getDateRangeForReportType } from "@/utils/reportGenerator";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Fix for TypeScript integration with jsPDF-AutoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface ReportVisualProps {
  unit: UnitData;
  reportType: string;
  metrics: {
    totalVolume: number;
    avgVolume: number;
    maxVolume: number;
    avgTemperature: number;
    totalUvcHours: number;
    dailyData: any[];
  };
}

export function ReportVisual({ unit, reportType, metrics }: ReportVisualProps) {
  const isMobile = useIsMobile();
  const { startDate, endDate } = getDateRangeForReportType(reportType);
  
  const generatePDF = () => {
    try {
      console.log("Starting PDF report generation...");
      console.log("Input data:", { unit, reportType, metrics });
      
      // Create a new jsPDF instance
      console.log("Initializing jsPDF...");
      const doc = new jsPDF();
      console.log("jsPDF initialized successfully");
      
      const pageWidth = doc.internal.pageSize.getWidth();
      console.log("Page width:", pageWidth);
      
      // Add company logo/header
      console.log("Adding company header...");
      doc.setFontSize(20);
      doc.setTextColor(0, 128, 0);
      doc.text("MYWATER Technologies", pageWidth / 2, 20, { align: "center" });
      
      // Add report title
      console.log("Adding report title...");
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`${reportType.toUpperCase()} REPORT: ${unit.name || ""}`, pageWidth / 2, 30, { align: "center" });
      
      // Add date range
      console.log("Adding date range...");
      doc.setFontSize(12);
      doc.text(
        `Period: ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`,
        pageWidth / 2, 
        40, 
        { align: "center" }
      );
      
      // Add unit information section
      console.log("Adding unit information...");
      doc.setFontSize(14);
      doc.text("Unit Information", 14, 50);
      doc.setFontSize(10);
      
      const unitInfo = [
        ["Name", unit.name || "N/A"],
        ["Location", unit.location || "N/A"],
        ["Status", unit.status || "N/A"],
        ["Total Capacity", `${unit.total_volume || 0} units`]
      ];
      
      console.log("Creating unit info table...");
      try {
        doc.autoTable({
          startY: 55,
          head: [["Property", "Value"]],
          body: unitInfo,
          theme: 'grid',
          headStyles: { fillColor: [0, 150, 0] }
        });
        console.log("Unit info table created successfully");
      } catch (tableError) {
        console.error("Error creating unit info table:", tableError);
        throw new Error(`Failed to create unit info table: ${tableError}`);
      }
      
      // Add performance metrics section
      console.log("Adding performance metrics...");
      doc.setFontSize(14);
      let currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 120;
      doc.text("Performance Metrics", 14, currentY);
      
      const performanceMetrics = [
        ["Total Volume Processed", `${metrics.totalVolume.toFixed(2)} units`],
        ["Average Daily Volume", `${metrics.avgVolume.toFixed(2)} units`],
        ["Maximum Daily Volume", `${metrics.maxVolume.toFixed(2)} units`],
        ["Average Temperature", `${metrics.avgTemperature.toFixed(2)} °C`],
        ["Total UVC Hours", `${metrics.totalUvcHours.toFixed(2)} hours`]
      ];
      
      console.log("Creating performance metrics table...");
      try {
        doc.autoTable({
          startY: currentY + 5,
          head: [["Metric", "Value"]],
          body: performanceMetrics,
          theme: 'grid',
          headStyles: { fillColor: [0, 150, 0] }
        });
        console.log("Performance metrics table created successfully");
      } catch (tableError) {
        console.error("Error creating performance metrics table:", tableError);
        throw new Error(`Failed to create performance metrics table: ${tableError}`);
      }
      
      // Add daily data table
      console.log("Adding daily measurements...");
      doc.setFontSize(14);
      currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 200;
      doc.text("Daily Measurements", 14, currentY);
      
      const dailyData = metrics.dailyData.map(day => [
        day.date,
        `${day.volume.toFixed(2)} units`,
        `${day.avgTemperature.toFixed(2)} °C`,
        `${day.uvcHours.toFixed(2)} hours`
      ]);
      
      console.log("Creating daily measurements table...");
      try {
        doc.autoTable({
          startY: currentY + 5,
          head: [["Date", "Volume", "Avg. Temperature", "UVC Hours"]],
          body: dailyData,
          theme: 'grid',
          headStyles: { fillColor: [0, 150, 0] }
        });
        console.log("Daily measurements table created successfully");
      } catch (tableError) {
        console.error("Error creating daily measurements table:", tableError);
        throw new Error(`Failed to create daily measurements table: ${tableError}`);
      }
      
      // Add maintenance information
      console.log("Adding maintenance information...");
      doc.setFontSize(14);
      currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 280;
      doc.text("Maintenance Information", 14, currentY);
      
      const maintenanceInfo = [
        ["Last Maintenance", unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : "N/A"],
        ["Next Maintenance", unit.next_maintenance ? new Date(unit.next_maintenance).toLocaleDateString() : "N/A"]
      ];
      
      console.log("Creating maintenance info table...");
      try {
        doc.autoTable({
          startY: currentY + 5,
          head: [["Maintenance", "Date"]],
          body: maintenanceInfo,
          theme: 'grid',
          headStyles: { fillColor: [0, 150, 0] }
        });
        console.log("Maintenance info table created successfully");
      } catch (tableError) {
        console.error("Error creating maintenance info table:", tableError);
        throw new Error(`Failed to create maintenance info table: ${tableError}`);
      }
      
      // Add contact information
      console.log("Adding contact information...");
      if (unit.contact_name || unit.contact_email || unit.contact_phone) {
        doc.setFontSize(14);
        currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 320;
        doc.text("Contact Information", 14, currentY);
        
        const contactInfo = [
          ["Name", unit.contact_name || "N/A"],
          ["Email", unit.contact_email || "N/A"],
          ["Phone", unit.contact_phone || "N/A"]
        ];
        
        console.log("Creating contact info table...");
        try {
          doc.autoTable({
            startY: currentY + 5,
            head: [["Contact", "Details"]],
            body: contactInfo,
            theme: 'grid',
            headStyles: { fillColor: [0, 150, 0] }
          });
          console.log("Contact info table created successfully");
        } catch (tableError) {
          console.error("Error creating contact info table:", tableError);
          throw new Error(`Failed to create contact info table: ${tableError}`);
        }
      }
      
      // Add notes if available
      console.log("Adding notes...");
      if (unit.notes) {
        doc.setFontSize(14);
        currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 350;
        doc.text("Notes", 14, currentY);
        doc.setFontSize(10);
        doc.text(unit.notes, 14, currentY + 10);
      }
      
      // Add footer with generation date
      console.log("Adding footer...");
      const generatedDate = new Date().toLocaleString();
      doc.setFontSize(8);
      doc.text(`Generated on: ${generatedDate}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: "right" });
      
      // Save the PDF
      console.log("Saving PDF...");
      const filename = `${reportType}-report-${unit.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      try {
        doc.save(filename);
        console.log("PDF saved successfully:", filename);
        
        toast({
          title: "Success",
          description: "Report downloaded successfully",
        });
        
        return `Successfully generated ${filename}`;
      } catch (saveError) {
        console.error("Error saving PDF:", saveError);
        throw new Error(`Failed to save PDF: ${saveError}`);
      }
    } catch (error) {
      // Log the full error
      console.error("Error generating PDF:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace available",
        unit,
        reportType,
        metrics: {
          ...metrics,
          dailyData: metrics.dailyData ? `${metrics.dailyData.length} items` : "No data"
        }
      });
      
      // Show error toast to the user
      toast({
        variant: "destructive",
        title: "FAILED TO DOWNLOAD REPORT",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  };
  
  // If no data available
  if (!metrics.dailyData.length) {
    return (
      <Card className="p-6 bg-spotify-darker border-spotify-accent">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
          <p className="text-gray-400 mb-4">
            There is no measurement data available for the selected period.
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold">
          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report: {unit.name}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={generatePDF}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 bg-spotify-darker border-spotify-accent">
          <h3 className="text-lg font-semibold mb-4">Report Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Total Volume</p>
              <p className="text-xl font-semibold">{metrics.totalVolume.toFixed(2)} units</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg. Temperature</p>
              <p className="text-xl font-semibold">{metrics.avgTemperature.toFixed(2)} °C</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total UVC Hours</p>
              <p className="text-xl font-semibold">{metrics.totalUvcHours.toFixed(2)} hours</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Date Range</p>
              <p className="text-sm font-medium">
                {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-spotify-darker border-spotify-accent">
          <h3 className="text-lg font-semibold mb-4">Unit Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Unit Status</p>
              <p className={`text-lg font-medium ${
                unit.status === 'active' ? 'text-green-400' :
                unit.status === 'warning' ? 'text-yellow-400' :
                unit.status === 'urgent' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {unit.status || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">UVC Status</p>
              <p className={`text-lg font-medium ${
                unit.uvc_status === 'active' ? 'text-green-400' :
                unit.uvc_status === 'warning' ? 'text-yellow-400' :
                unit.uvc_status === 'urgent' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {unit.uvc_status || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Last Maintenance</p>
              <p className="text-sm">
                {unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Next Maintenance</p>
              <p className="text-sm">
                {unit.next_maintenance ? new Date(unit.next_maintenance).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportChart 
          data={metrics.dailyData} 
          title="Daily Water Volume" 
          type="volume" 
        />
        
        <ReportChart 
          data={metrics.dailyData} 
          title="Temperature Trends" 
          type="temperature" 
        />
        
        <ReportChart 
          data={metrics.dailyData} 
          title="UVC Hours" 
          type="uvc" 
        />
      </div>
      
      <Card className="p-4 bg-spotify-darker border-spotify-accent">
        <h3 className="text-lg font-semibold mb-4">Daily Measurements</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg. Temperature</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">UVC Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {metrics.dailyData.map((day, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-spotify-dark' : 'bg-spotify-darker'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {day.volume.toFixed(2)} units
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {day.avgTemperature.toFixed(2)} °C
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {day.uvcHours.toFixed(2)} hours
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
