
import { ReportData } from "@/types/analytics";
import { useState } from "react";
import { useReportOperations } from "@/hooks/useReportOperations";
import { ReportCard } from "./ReportCard";
import { ReportPreviewDialog } from "./ReportPreviewDialog";
import { DeleteReportDialog } from "./DeleteReportDialog";

interface ReportsListProps {
  reports: ReportData[];
  onDeleteReport?: (reportId: string) => void;
  isDeletingReport?: boolean;
}

export function ReportsList({ reports, onDeleteReport, isDeletingReport = false }: ReportsListProps) {
  const {
    isPreviewDialogOpen,
    setIsPreviewDialogOpen,
    selectedReport,
    unitData,
    reportMetrics,
    isLoading,
    reportToDelete,
    setReportToDelete,
    handleDownloadReport,
    handlePreviewReport
  } = useReportOperations();

  const handleDeleteClick = (reportId: string) => {
    setReportToDelete(reportId);
  };

  const confirmDelete = () => {
    if (reportToDelete && onDeleteReport) {
      onDeleteReport(reportToDelete);
      setReportToDelete(null);
    }
  };

  const cancelDelete = () => {
    setReportToDelete(null);
  };

  if (reports.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Generated Reports</h2>
        <div className="grid gap-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onPreview={handlePreviewReport}
              onDownload={handleDownloadReport}
              onDelete={handleDeleteClick}
              isLoading={isLoading}
              isDeletingReport={isDeletingReport}
            />
          ))}
        </div>
      </div>

      <ReportPreviewDialog
        isOpen={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
        selectedReport={selectedReport}
        unitData={unitData}
        reportMetrics={reportMetrics}
        isLoading={isLoading}
      />

      <DeleteReportDialog
        isOpen={!!reportToDelete}
        onOpenChange={(open) => !open && setReportToDelete(null)}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        isDeletingReport={isDeletingReport}
      />
    </>
  );
}
