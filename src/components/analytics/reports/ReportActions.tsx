
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { UnitData } from "@/types/analytics";
import { generatePDF } from "@/utils/pdfGenerator";
import { toast } from "@/components/ui/use-toast";
import { getReportTitle } from "@/utils/reportUtils";
import { format } from "date-fns";

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
      console.log("Generating PDF for unit:", unit.name);
      await generatePDF(unit, reportType, metrics, startDate, endDate);
      toast({
        title: "Success",
        description: "PDF generated and downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF",
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
