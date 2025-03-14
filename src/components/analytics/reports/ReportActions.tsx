
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { UnitData } from "@/types/analytics";
import { toast } from "@/components/ui/use-toast";
import { getReportTitle } from "@/utils/reportUtils";
import { generatePDF } from "@/utils/pdfGenerator";

interface ReportActionsProps {
  unit: UnitData;
  reportType: string;
  metrics: any;
  startDate: Date;
  endDate: Date;
}

export function ReportActions({ unit, reportType, metrics, startDate, endDate }: ReportActionsProps) {
  const handleGeneratePDF = async () => {
    try {
      console.log("Generating PDF from ReportActions");
      const pdfBlob = await generatePDF(unit, reportType, metrics, startDate, endDate);
      
      // Create a download link
      const url = URL.createObjectURL(pdfBlob);
      const fileName = `${unit.name}_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create an anchor element for downloading
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      
      // Trigger download and clean up
      console.log("Triggering download for", fileName);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
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

  const handlePrint = () => {
    window.print();
  };

  // Create the formatted report title
  const formattedTitle = `${unit.name} - ${getReportTitle(reportType)}`;

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">
        {formattedTitle}
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrint}
          className="flex items-center print:hidden"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>
    </div>
  );
}
