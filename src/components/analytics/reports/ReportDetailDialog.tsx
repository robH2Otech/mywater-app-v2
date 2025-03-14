
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportData } from "@/types/analytics";
import { ReportVisual } from "./ReportVisual";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { toast } from "@/components/ui/use-toast";
import { calculateMetricsFromMeasurements } from "@/utils/reportGenerator";
import { getReportTitle } from "@/utils/reportUtils";

interface ReportDetailDialogProps {
  report: ReportData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDetailDialog({ report, open, onOpenChange }: ReportDetailDialogProps) {
  const [unitData, setUnitData] = useState<any>(null);
  const [reportMetrics, setReportMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadReportDetails() {
      if (!open || !report) return;
      
      setIsLoading(true);
      try {
        // Fetch unit data
        const unitDocRef = doc(db, "units", report.unit_id);
        const unitSnapshot = await getDoc(unitDocRef);
        
        if (unitSnapshot.exists()) {
          const unitDataObj = {
            id: unitSnapshot.id,
            ...unitSnapshot.data()
          };
          setUnitData(unitDataObj);
          
          // Use pre-calculated metrics if available, otherwise calculate from measurements
          if (report.metrics) {
            setReportMetrics(report.metrics);
          } else {
            // Calculate metrics from measurements
            const measurements = report.measurements || [];
            const metrics = calculateMetricsFromMeasurements(measurements);
            setReportMetrics(metrics);
          }
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Unit data not found",
          });
        }
      } catch (error) {
        console.error("Error loading report details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load report details",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadReportDetails();
  }, [open, report]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-spotify-dark">
        <DialogHeader>
          <DialogTitle>
            {getReportTitle(report?.report_type)} - Details
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green"></div>
          </div>
        ) : unitData && reportMetrics ? (
          <ReportVisual 
            unit={unitData} 
            reportType={report.report_type} 
            metrics={reportMetrics} 
          />
        ) : (
          <div className="p-4 text-center text-red-400">
            Unable to load report details. Please try again.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
