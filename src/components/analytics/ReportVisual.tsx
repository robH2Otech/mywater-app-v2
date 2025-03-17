
import { UnitData } from "@/types/analytics";
import { ReportChart } from "./ReportChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { format } from "date-fns";
import { getDateRangeForReportType } from "@/utils/reportGenerator";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import html2canvas from "html2canvas";

// Fix for TypeScript integration with jsPDF-AutoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    } | undefined;
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

// Refactored PDF utility functions
import { PDFUtils } from "./pdf/PDFUtils";

export function ReportVisual({ unit, reportType, metrics }: ReportVisualProps) {
  const isMobile = useIsMobile();
  const { startDate, endDate } = getDateRangeForReportType(reportType);
  
  // Use refactored PDF functions
  const generateVisualPDF = async () => {
    try {
      console.log("Starting visual PDF report generation...");
      
      // Find the report container element
      const reportContainer = document.querySelector('.report-container') as HTMLElement;
      if (!reportContainer) {
        throw new Error("Report container element not found");
      }
      
      toast({
        title: "Generating PDF",
        description: "Please wait while we create your report...",
      });
      
      // Use html2canvas to capture the report as an image
      const canvas = await html2canvas(reportContainer, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: true,
        backgroundColor: "#121212", // Match the background color
      });
      
      // Calculate PDF dimensions to match aspect ratio of the captured element
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      // Create PDF with the right dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed for long reports
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      const filename = `${reportType}-report-${unit.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(filename);
      
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
      
      return `Successfully generated ${filename}`;
    } catch (error) {
      console.error("Error generating visual PDF:", error);
      
      toast({
        variant: "destructive",
        title: "FAILED TO DOWNLOAD REPORT",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  };
  
  // Manual table drawing function as a fallback
  const drawTableManually = (doc: jsPDF, data: any[], headers: string[], startY: number, title: string) => {
    console.log(`Drawing table manually: ${title} with ${data.length} rows`);
    
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginSize = 14; // Define margin variable here
      const usablePageWidth = pageWidth - (marginSize * 2);
      const colWidth = usablePageWidth / headers.length;
      const rowHeight = 10;
      
      // Draw title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, marginSize, startY);
      startY += 6;
      
      // Draw header row
      doc.setFillColor(0, 150, 0);
      doc.rect(marginSize, startY, usablePageWidth, rowHeight, 'F');
      
      // Draw header text
      doc.setTextColor(255, 255, 255);
      headers.forEach((header, i) => {
        doc.text(header, marginSize + (i * colWidth) + 2, startY + 7);
      });
      
      startY += rowHeight;
      
      // Draw data rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      
      // Use pagination for large data sets
      const rowsPerPage = 25;
      const totalPages = Math.ceil(data.length / rowsPerPage);
      
      for (let p = 0; p < totalPages; p++) {
        if (p > 0) {
          doc.addPage();
          startY = 20; // Reset Y position for new page
          
          // Add page header if necessary
          doc.setFontSize(10);
          doc.text(`${title} (continued)`, marginSize, startY);
          startY += 10;
        }
        
        const startIdx = p * rowsPerPage;
        const endIdx = Math.min(startIdx + rowsPerPage, data.length);
        
        for (let i = startIdx; i < endIdx; i++) {
          // Add row background (alternating)
          if (i % 2 === 0) {
            doc.setFillColor(240, 240, 240);
          } else {
            doc.setFillColor(255, 255, 255);
          }
          doc.rect(marginSize, startY, usablePageWidth, rowHeight, 'F');
          
          // Add row border
          doc.setDrawColor(200, 200, 200);
          doc.rect(marginSize, startY, usablePageWidth, rowHeight, 'S');
          
          // Add cell text
          data[i].forEach((cell: any, j: number) => {
            // Handle different data types
            const cellText = (cell !== null && cell !== undefined) ? String(cell) : 'N/A';
            
            // Truncate text if too long for cell
            const maxChars = colWidth / 2; // Approximate chars that fit in column
            const displayText = cellText.length > maxChars ? 
                               cellText.substring(0, maxChars - 3) + '...' : cellText;
            
            doc.text(displayText, marginSize + (j * colWidth) + 2, startY + 7);
          });
          
          startY += rowHeight;
          
          // Check if we need a new page
          if (startY > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            startY = 20;
          }
        }
      }
      
      return startY + 10; // Return the new Y position
    } catch (error) {
      console.error("Error in manual table drawing:", error);
      doc.setTextColor(255, 0, 0);
      const marginSize = 14; // Define margin variable here as well for error case
      doc.text(`Error drawing table: ${error instanceof Error ? error.message : String(error)}`, marginSize, startY + 10);
      return startY + 20;
    }
  };
  
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
      const marginSize = 14; // Define margin variable here
      
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
        ["Total Capacity", `${unit.total_volume || 0} m³`]
      ];
      
      // First try with autoTable
      let currentY = 55;
      console.log("Creating unit info table...");
      try {
        doc.autoTable({
          startY: currentY,
          head: [["Property", "Value"]],
          body: unitInfo,
          theme: 'grid',
          headStyles: { fillColor: [0, 150, 0] }
        });
        console.log("Unit info table created successfully");
        currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 120;
      } catch (tableError) {
        // Fallback to manual table drawing
        console.error("Error creating unit info table with autoTable:", tableError);
        console.log("Falling back to manual table drawing...");
        
        const unitInfoHeaders = ["Property", "Value"];
        currentY = drawTableManually(doc, unitInfo, unitInfoHeaders, currentY, "Unit Information");
      }
      
      // Add performance metrics section
      console.log("Adding performance metrics...");
      doc.setFontSize(14);
      doc.text("Performance Metrics", 14, currentY);
      
      const performanceMetrics = [
        ["Total Volume Processed", `${metrics.totalVolume.toFixed(2)} m³`],
        ["Average Daily Volume", `${metrics.avgVolume.toFixed(2)} m³`],
        ["Maximum Daily Volume", `${metrics.maxVolume.toFixed(2)} m³`],
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
        currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 200;
      } catch (tableError) {
        // Fallback to manual table drawing
        console.error("Error creating performance metrics table:", tableError);
        const metricsHeaders = ["Metric", "Value"];
        currentY = drawTableManually(doc, performanceMetrics, metricsHeaders, currentY + 5, "Performance Metrics");
      }
      
      // Add daily data table
      console.log("Adding daily measurements...");
      doc.setFontSize(14);
      doc.text("Daily Measurements", 14, currentY);
      
      const dailyData = metrics.dailyData.map(day => [
        new Date(day.date).toLocaleDateString(),
        `${day.volume.toFixed(2)} m³`,
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
          headStyles: { fillColor: [0, 150, 0] },
          didDrawPage: (data) => {
            // Add header to each page
            doc.setFontSize(8);
            doc.text(`${reportType.toUpperCase()} REPORT - ${unit.name || ""}`, pageWidth / 2, 10, { align: "center" });
          }
        });
        console.log("Daily measurements table created successfully");
        currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 280;
      } catch (tableError) {
        // Fallback to manual table drawing
        console.error("Error creating daily measurements table:", tableError);
        const dailyHeaders = ["Date", "Volume", "Avg. Temperature", "UVC Hours"];
        currentY = drawTableManually(doc, dailyData, dailyHeaders, currentY + 5, "Daily Measurements");
      }
      
      // Add maintenance information
      console.log("Adding maintenance information...");
      doc.setFontSize(14);
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
        currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 320;
      } catch (tableError) {
        // Fallback to manual table drawing
        console.error("Error creating maintenance info table:", tableError);
        const maintenanceHeaders = ["Maintenance", "Date"];
        currentY = drawTableManually(doc, maintenanceInfo, maintenanceHeaders, currentY + 5, "Maintenance Information");
      }
      
      // Add contact information
      console.log("Adding contact information...");
      if (unit.contact_name || unit.contact_email || unit.contact_phone) {
        doc.setFontSize(14);
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
          currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 350;
        } catch (tableError) {
          // Fallback to manual table drawing
          console.error("Error creating contact info table:", tableError);
          const contactHeaders = ["Contact", "Details"];
          currentY = drawTableManually(doc, contactInfo, contactHeaders, currentY + 5, "Contact Information");
        }
      }
      
      // Add notes if available
      console.log("Adding notes...");
      if (unit.notes) {
        doc.setFontSize(14);
        currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 350;
        doc.text("Notes", 14, currentY);
        doc.setFontSize(10);
        
        // Split notes into multiple lines if needed
        const notesLines = doc.splitTextToSize(unit.notes, pageWidth - 28);
        doc.text(notesLines, 14, currentY + 10);
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
    <div className="space-y-6 report-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold">
          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report: {unit.name}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={generateVisualPDF}
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
              <p className="text-xl font-semibold">{metrics.totalVolume.toFixed(2)} m³</p>
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
          unit="m³"
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
                    {day.volume.toFixed(2)} m³
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
