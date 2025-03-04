
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ReportData } from "@/types/analytics";

interface ReportsListProps {
  reports: ReportData[];
}

export function ReportsList({ reports }: ReportsListProps) {
  const handleDownloadReport = async (reportId: string, content: string) => {
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

  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold">Generated Reports</h2>
      <div className="grid gap-4">
        {reports.map((report) => (
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
                onClick={() => handleDownloadReport(report.id, report.content)}
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
  );
}
