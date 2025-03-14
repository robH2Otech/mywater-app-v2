
import { ReportData } from "@/types/analytics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getReportTitle, downloadReportAsTxt } from "@/utils/reportUtils";
import { formatDistanceToNow } from "date-fns";

interface ReportListItemProps {
  report: ReportData;
  onViewReport: (report: ReportData) => void;
}

export function ReportListItem({ report, onViewReport }: ReportListItemProps) {
  const handleDownloadTxt = async () => {
    try {
      await downloadReportAsTxt(report);
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

  // Handle timestamp formatting
  const createdAt = report.created_at ? 
    (typeof report.created_at === 'string' ? 
      new Date(report.created_at) : 
      // @ts-ignore - Handle Firestore Timestamp
      report.created_at.toDate ? report.created_at.toDate() : new Date()
    ) : 
    new Date();

  return (
    <Card key={report.id} className="p-4 bg-spotify-darker">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white">
            {getReportTitle(report.report_type)}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Generated {formatDistanceToNow(createdAt, { addSuffix: true })}
          </p>
          <div className="mt-2 text-sm text-gray-300 line-clamp-3 whitespace-pre-wrap">
            {report.content}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewReport(report)}
            className="flex items-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTxt}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
}
