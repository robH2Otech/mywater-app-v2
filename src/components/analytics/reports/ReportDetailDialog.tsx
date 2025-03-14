
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ReportData, UnitData } from "@/types/analytics";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { downloadReportAsPdf } from "@/utils/reportUtils";
import { toast } from "@/components/ui/use-toast";
import { getReportTitle } from "@/utils/reportUtils";
import { ReportVisual } from "../ReportVisual";
import { calculateMetricsFromMeasurements } from "@/utils/reportGenerator";

interface ReportDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportData;
}

export function ReportDetailDialog({ open, onOpenChange, report }: ReportDetailDialogProps) {
  const [unit, setUnit] = useState<UnitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Fetch unit data when report changes
  useEffect(() => {
    const fetchUnitData = async () => {
      if (!report) return;
      
      try {
        setIsLoading(true);
        const unitRef = doc(db, "units", report.unit_id);
        const unitSnap = await getDoc(unitRef);
        
        if (unitSnap.exists()) {
          setUnit({
            id: unitSnap.id,
            ...unitSnap.data()
          } as UnitData);
        } else {
          console.error("Unit not found");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Unit data not found",
          });
        }
      } catch (error) {
        console.error("Error fetching unit data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load unit data",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (open && report) {
      fetchUnitData();
    }
  }, [report, open]);
  
  const handleDownload = async () => {
    if (!report || isDownloading) return;
    
    try {
      setIsDownloading(true);
      await downloadReportAsPdf(report);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download report",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Calculate metrics from report measurements
  let metrics = report?.metrics || {
    totalVolume: 0,
    avgVolume: 0,
    maxVolume: 0,
    avgTemperature: 0,
    totalUvcHours: 0,
    dailyData: []
  };
  
  // If report has measurements but no calculated metrics, calculate them
  if (report?.measurements && report.measurements.length > 0 && !report.metrics) {
    metrics = calculateMetricsFromMeasurements(report.measurements);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-spotify-darker text-white border-spotify-accent max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle>Report Details</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse">Loading report details...</div>
          </div>
        ) : unit ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {unit.name} - {getReportTitle(report.report_type)}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Downloading..." : "Download PDF"}
              </Button>
            </div>
            
            <ReportVisual 
              unit={unit}
              reportType={report.report_type}
              metrics={metrics}
            />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p>Failed to load report details.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
