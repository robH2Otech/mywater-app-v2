
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Eye, Trash2 } from "lucide-react";
import { ReportData } from "@/types/analytics";

interface ReportCardProps {
  report: ReportData;
  onPreview: (report: ReportData) => void;
  onDownload: (report: ReportData) => void;
  onDelete: (reportId: string) => void;
  isLoading: boolean;
  isDeletingReport: boolean;
}

export function ReportCard({
  report,
  onPreview,
  onDownload,
  onDelete,
  isLoading,
  isDeletingReport
}: ReportCardProps) {
  return (
    <Card key={report.id} className="p-4 bg-spotify-darker">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white">
            {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Generated on {new Date(report.created_at).toLocaleString()}
          </p>
          <div className="mt-2 text-sm text-gray-300 line-clamp-3 whitespace-pre-wrap">
            {report.content.replace(/units/g, 'm³')}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(report)}
            disabled={isLoading}
            className="flex items-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(report.id)}
            disabled={isLoading || isDeletingReport}
            className="flex items-center text-red-500 hover:text-red-700 hover:bg-red-100/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
