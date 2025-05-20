
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { ReportData } from "@/types/analytics";
import { format } from "date-fns";

interface ReportCardProps {
  report: ReportData;
}

export function ReportCard({ report }: ReportCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return "Invalid date";
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "monthly": return "Monthly";
      case "quarterly": return "Quarterly";
      case "annual": return "Annual";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Get unit name from report content safely
  const unitName = report.content && typeof report.content === 'object' ? 
    (report.content as any).unit_name || "Unit" : 
    "Unit";

  // Extract metrics if they exist and are in the expected format
  const metrics = report.content && typeof report.content === 'object' ? 
    (report.content as any).metrics : null;

  const totalVolume = metrics?.totalVolume !== undefined ? 
    metrics.totalVolume.toFixed(0) : "N/A";
    
  const avgTemperature = metrics?.avgTemperature !== undefined ? 
    metrics.avgTemperature.toFixed(1) : "N/A";

  return (
    <Card className="p-4 bg-spotify-darker border-spotify-accent hover:border-mywater-blue transition-colors">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-mywater-blue mr-2" />
            <h3 className="text-md font-medium">{getReportTypeLabel(report.report_type)} Report</h3>
          </div>
          <Badge variant="outline" className="bg-spotify-accent text-xs">
            {formatDate(report.created_at)}
          </Badge>
        </div>
        
        <div className="mt-2 text-sm text-gray-300 flex-grow">
          <p>Generated report for {unitName}</p>
          {metrics && (
            <div className="mt-2 space-y-1">
              <p>Total Volume: {totalVolume} m³</p>
              <p>Average Temperature: {avgTemperature}°C</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" className="bg-spotify-accent hover:bg-spotify-accent-hover text-white text-xs">
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
}
