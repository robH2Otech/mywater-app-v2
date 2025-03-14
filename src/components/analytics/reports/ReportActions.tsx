
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { UnitData } from "@/types/analytics";
import { toast } from "@/hooks/use-toast";
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
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGeneratePDF = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      console.log("Generating PDF from ReportActions");
      
      // Generate the PDF
      const pdfBlob = await generatePDF(unit, reportType, metrics, startDate, endDate);
      
      if (!pdfBlob) {
        throw new Error("Failed to generate PDF blob");
      }
      
      console.log("PDF Blob created successfully, size:", pdfBlob.size, "bytes");
      
      // Create a download link
      const fileName = `${unit.name}_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create a download link using a simpler approach
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
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
    } finally {
      setIsDownloading(false);
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
          disabled={isDownloading}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? "Downloading..." : "Download PDF"}
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
