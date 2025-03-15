
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { generatePDF } from "@/utils/pdfGenerator";
import { UnitData } from "@/types/analytics";

interface ReportActionsProps {
  reportType: string;
  unit: UnitData;
  reportId?: string;
  metrics: any;
}

export function ReportActions({ reportType, unit, reportId, metrics }: ReportActionsProps) {
  const handleGeneratePDF = async () => {
    try {
      console.log("Starting PDF generation for report preview");
      
      // Generate a clean filename with ISO date format
      const fileName = `${reportType}-report-${unit.name?.replace(/\s+/g, '-').toLowerCase() || 'unit'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Create a mock report data object for the PDF generator
      const reportData = {
        id: reportId || 'preview',
        unit_id: unit.id,
        report_type: reportType,
        content: "",
        measurements: [],
        created_at: new Date().toISOString(),
        generated_by: "system" // Required by ReportData type
      };
      
      await generatePDF(reportData, unit, metrics, fileName);
      
      toast({
        title: "Success",
        description: "PDF report downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">
        {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report: {unit.name}
      </h2>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGeneratePDF}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
