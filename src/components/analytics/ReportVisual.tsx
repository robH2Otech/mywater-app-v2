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

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
  lastAutoTable: {
    finalY: number;
  };
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
  const { startDate, endDate } = getDateRangeForReportType(reportType);
  
  const generatePDF = () => {
    try {
      // Create a new jsPDF instance
      const pdfDoc = new jsPDF() as JsPDFWithAutoTable;
      const pageWidth = pdfDoc.internal.pageSize.getWidth();
      
      // Add company logo/header
      pdfDoc.setFontSize(20);
      pdfDoc.setTextColor(0, 128, 0);
      pdfDoc.text("MYWATER Technologies", pageWidth / 2, 20, { align: "center" });
      
      // Add report title
      pdfDoc.setFontSize(16);
      pdfDoc.setTextColor(0, 0, 0);
      pdfDoc.text(`${reportType.toUpperCase()} REPORT: ${unit.name || ""}`, pageWidth / 2, 30, { align: "center" });
      
      // Add date range
      pdfDoc.setFontSize(12);
      pdfDoc.text(
        `Period: ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`,
        pageWidth / 2, 
        40, 
        { align: "center" }
      );
      
      // Add unit information section
      pdfDoc.setFontSize(14);
      pdfDoc.text("Unit Information", 14, 50);
      pdfDoc.setFontSize(10);
      
      const unitInfo = [
        ["Name", unit.name || "N/A"],
        ["Location", unit.location || "N/A"],
        ["Status", unit.status || "N/A"],
        ["Total Capacity", `${unit.total_volume || 0} m³`]
      ];
      
      pdfDoc.autoTable({
        startY: 55,
        head: [["Property", "Value"]],
        body: unitInfo,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 0] }
      });
      
      // Add performance metrics section
      let startY = pdfDoc.lastAutoTable.finalY + 10;
      pdfDoc.setFontSize(14);
      pdfDoc.text("Performance Metrics", 14, startY);
      
      const performanceMetrics = [
        ["Total Volume Processed", `${metrics.totalVolume.toFixed(2)} m³`],
        ["Average Daily Volume", `${metrics.avgVolume.toFixed(2)} m³`],
        ["Maximum Daily Volume", `${metrics.maxVolume.toFixed(2)} m³`],
        ["Average Temperature", `${metrics.avgTemperature.toFixed(2)} °C`],
        ["Total UVC Hours", `${metrics.totalUvcHours.toFixed(2)} hours`]
      ];
      
      pdfDoc.autoTable({
        startY: startY + 5,
        head: [["Metric", "Value"]],
        body: performanceMetrics,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 0] }
      });
      
      // Add daily data table
      startY = pdfDoc.lastAutoTable.finalY + 10;
      pdfDoc.setFontSize(14);
      pdfDoc.text("Daily Measurements", 14, startY);
      
      const dailyData = metrics.dailyData.map(day => [
        day.date,
        `${day.volume.toFixed(2)} m³`,
        `${day.avgTemperature.toFixed(2)} °C`,
        `${day.uvcHours.toFixed(2)} hours`
      ]);
      
      pdfDoc.autoTable({
        startY: startY + 5,
        head: [["Date", "Volume", "Avg. Temperature", "UVC Hours"]],
        body: dailyData,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 0] }
      });
      
      // Add maintenance information
      startY = pdfDoc.lastAutoTable.finalY + 10;
      pdfDoc.setFontSize(14);
      pdfDoc.text("Maintenance Information", 14, startY);
      
      const maintenanceInfo = [
        ["Last Maintenance", unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : "N/A"],
        ["Next Maintenance", unit.next_maintenance ? new Date(unit.next_maintenance).toLocaleDateString() : "N/A"]
      ];
      
      pdfDoc.autoTable({
        startY: startY + 5,
        head: [["Maintenance", "Date"]],
        body: maintenanceInfo,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 0] }
      });
      
      // Add contact information
      if (unit.contact_name || unit.contact_email || unit.contact_phone) {
        startY = pdfDoc.lastAutoTable.finalY + 10;
        pdfDoc.setFontSize(14);
        pdfDoc.text("Contact Information", 14, startY);
        
        const contactInfo = [
          ["Name", unit.contact_name || "N/A"],
          ["Email", unit.contact_email || "N/A"],
          ["Phone", unit.contact_phone || "N/A"]
        ];
        
        pdfDoc.autoTable({
          startY: startY + 5,
          head: [["Contact", "Details"]],
          body: contactInfo,
          theme: 'grid',
          headStyles: { fillColor: [0, 150, 0] }
        });
      }
      
      // Add notes if available
      if (unit.notes) {
        startY = pdfDoc.lastAutoTable.finalY + 10;
        pdfDoc.setFontSize(14);
        pdfDoc.text("Notes", 14, startY);
        pdfDoc.setFontSize(10);
        pdfDoc.text(unit.notes, 14, startY + 10);
      }
      
      // Add footer with generation date
      const generatedDate = new Date().toLocaleString();
      pdfDoc.setFontSize(8);
      pdfDoc.text(`Generated on: ${generatedDate}`, pageWidth - 15, pdfDoc.internal.pageSize.getHeight() - 10, { align: "right" });
      
      // Generate the PDF as a blob and download it
      const pdfBlob = pdfDoc.output('blob');
      const fileName = `${reportType}-report-${unit.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Create URL object from the blob
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Create and trigger download link
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      toast({
        title: "Success",
        description: "PDF report downloaded successfully",
      });
      
      console.log("PDF generated and download triggered successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download report. Please try again.",
      });
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report: {unit.name}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
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
