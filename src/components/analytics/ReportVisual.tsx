import { UnitData } from "@/types/analytics";
import { ReportChart } from "./ReportChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { getDateRangeForReportType } from "@/utils/reportGenerator";
import { toast } from "@/components/ui/use-toast";
import { generatePDF } from "@/utils/pdfGenerator";

interface ReportVisualProps {
  unit: UnitData;
  reportType: string;
  reportId?: string;
  metrics: {
    totalVolume: number;
    avgVolume: number;
    maxVolume: number;
    avgTemperature: number;
    totalUvcHours: number;
    dailyData: any[];
  };
}

export function ReportVisual({ unit, reportType, metrics, reportId }: ReportVisualProps) {
  const { startDate, endDate } = getDateRangeForReportType(reportType);
  
  const handleGeneratePDF = async () => {
    try {
      console.log("Starting PDF generation for report preview");
      
      // Generate a clean filename with ISO date format
      const fileName = `${reportType}-report-${unit.name?.replace(/\s+/g, '-').toLowerCase() || 'unit'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Create a mock report data object for the PDF generator
      const reportData = {
        id: reportId || 'preview',
        unit_id: unit.id,
        report_type: reportType,
        content: "",
        measurements: [],
        created_at: new Date().toISOString(),
        generated_by: "system" // Required by ReportData type
      };
      
      await generatePDF(reportData, unit, metrics, fileName);
      
      toast({
        title: "Success",
        description: "PDF report downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
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
            onClick={handleGeneratePDF}
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
