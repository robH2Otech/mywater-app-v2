
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { UnitData } from "@/types/analytics";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";

/**
 * Generates a PDF with a visual capture of the report
 */
export const generateVisualPDF = async (
  reportContainer: HTMLElement,
  unit: UnitData,
  reportType: string
): Promise<string> => {
  try {
    console.log("Starting visual PDF report generation...");
    
    toast({
      title: "Generating PDF",
      description: "Please wait while we create your report...",
    });
    
    // Use html2canvas to capture the report as an image
    const canvas = await html2canvas(reportContainer, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: true,
      backgroundColor: "#121212", // Match the background color
    });
    
    // Calculate PDF dimensions to match aspect ratio of the captured element
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    // Create PDF with the right dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed for long reports
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    const filename = `${reportType}-report-${unit.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    pdf.save(filename);
    
    toast({
      title: "Success",
      description: "Report downloaded successfully",
    });
    
    return `Successfully generated ${filename}`;
  } catch (error) {
    console.error("Error generating visual PDF:", error);
    
    toast({
      variant: "destructive",
      title: "FAILED TO DOWNLOAD REPORT",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
    });
    
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
};
