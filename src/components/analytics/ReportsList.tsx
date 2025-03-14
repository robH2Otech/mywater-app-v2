
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ReportData } from "@/types/analytics";
import { ReportListItem } from "./reports/ReportListItem";
import { ReportEmptyState } from "./reports/ReportEmptyState";
import { ReportDetailDialog } from "./reports/ReportDetailDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

interface ReportsListProps {
  reports: ReportData[];
  isLoading: boolean;
  error: Error | null;
}

export function ReportsList({ reports, isLoading, error }: ReportsListProps) {
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Close dialog when reports change (e.g., when unit selection changes)
  useEffect(() => {
    setIsViewDialogOpen(false);
    setSelectedReport(null);
  }, [reports]);

  // Handle view report
  const handleViewReport = (report: ReportData) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Generated Reports</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="p-4 bg-spotify-darker">
              <LoadingSkeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Generated Reports</h2>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading reports: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show empty state
  if (reports.length === 0) {
    return <ReportEmptyState />;
  }

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold">Generated Reports</h2>
      <div className="grid gap-4">
        {reports.map((report) => (
          <ReportListItem 
            key={report.id} 
            report={report} 
            onViewReport={handleViewReport} 
          />
        ))}
      </div>

      {selectedReport && (
        <ReportDetailDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          report={selectedReport}
        />
      )}
    </div>
  );
}
