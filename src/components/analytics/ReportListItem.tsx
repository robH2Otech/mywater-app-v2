
import { ReportData } from "@/types/analytics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText } from "lucide-react";
import { useState } from "react";

interface ReportListItemProps {
  report: ReportData;
  onView: (report: ReportData) => void;
  onDownload: (report: ReportData) => void;
  isLoading: boolean;
}

export function ReportListItem({ 
  report, 
  onView, 
  onDownload, 
  isLoading 
}: ReportListItemProps) {
  return (
    <Card className="p-4 bg-spotify-darker hover:bg-spotify-dark transition-colors duration-200">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="bg-spotify-accent p-2 rounded-md">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
              {report.unit_name ? ` - ${report.unit_name}` : ''}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Generated on {new Date(report.created_at).toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-gray-300 line-clamp-2 whitespace-pre-wrap">
              {report.content?.substring(0, 100)}...
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(report)}
            disabled={isLoading}
            className="flex items-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(report)}
            disabled={isLoading}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </Card>
  );
}
