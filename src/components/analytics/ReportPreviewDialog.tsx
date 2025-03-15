
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportData, UnitData } from "@/types/analytics";
import { ReportVisual } from "./ReportVisual";

interface ReportPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedReport: ReportData | null;
  unitData: UnitData | null;
  reportMetrics: any;
  isLoading: boolean;
}

export function ReportPreviewDialog({
  isOpen,
  onOpenChange,
  selectedReport,
  unitData,
  reportMetrics,
  isLoading
}: ReportPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-spotify-dark">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
        </DialogHeader>
        
        {selectedReport && unitData && reportMetrics ? (
          <ReportVisual 
            unit={unitData} 
            reportType={selectedReport.report_type} 
            metrics={reportMetrics} 
            reportId={selectedReport.id}
          />
        ) : (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
