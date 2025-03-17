
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";

export class PDFUtils {
  /**
   * Generate a visual PDF by capturing a DOM element
   */
  static async generateVisualPDF(
    containerSelector: string, 
    filename: string
  ): Promise<string> {
    try {
      // Find the report container element
      const container = document.querySelector(containerSelector) as HTMLElement;
      if (!container) {
        throw new Error(`Container element not found: ${containerSelector}`);
      }
      
      toast({
        title: "Generating PDF",
        description: "Please wait while we create your report...",
      });
      
      // Use html2canvas to capture the report as an image
      const canvas = await html2canvas(container, {
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
  }
  
  /**
   * Draw a table manually in the PDF when autoTable fails
   */
  static drawTableManually(
    doc: jsPDF, 
    data: any[], 
    headers: string[], 
    startY: number, 
    title: string,
    marginSize: number = 14
  ): number {
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const usablePageWidth = pageWidth - (marginSize * 2);
      const colWidth = usablePageWidth / headers.length;
      const rowHeight = 10;
      
      // Draw title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, marginSize, startY);
      startY += 6;
      
      // Draw header row
      doc.setFillColor(0, 150, 0);
      doc.rect(marginSize, startY, usablePageWidth, rowHeight, 'F');
      
      // Draw header text
      doc.setTextColor(255, 255, 255);
      headers.forEach((header, i) => {
        doc.text(header, marginSize + (i * colWidth) + 2, startY + 7);
      });
      
      startY += rowHeight;
      
      // Draw data rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      
      // Use pagination for large data sets
      const rowsPerPage = 25;
      const totalPages = Math.ceil(data.length / rowsPerPage);
      
      for (let p = 0; p < totalPages; p++) {
        if (p > 0) {
          doc.addPage();
          startY = 20; // Reset Y position for new page
          
          // Add page header if necessary
          doc.setFontSize(10);
          doc.text(`${title} (continued)`, marginSize, startY);
          startY += 10;
        }
        
        const startIdx = p * rowsPerPage;
        const endIdx = Math.min(startIdx + rowsPerPage, data.length);
        
        for (let i = startIdx; i < endIdx; i++) {
          // Add row background (alternating)
          if (i % 2 === 0) {
            doc.setFillColor(240, 240, 240);
          } else {
            doc.setFillColor(255, 255, 255);
          }
          doc.rect(marginSize, startY, usablePageWidth, rowHeight, 'F');
          
          // Add row border
          doc.setDrawColor(200, 200, 200);
          doc.rect(marginSize, startY, usablePageWidth, rowHeight, 'S');
          
          // Add cell text
          data[i].forEach((cell: any, j: number) => {
            // Handle different data types
            const cellText = (cell !== null && cell !== undefined) ? String(cell) : 'N/A';
            
            // Truncate text if too long for cell
            const maxChars = colWidth / 2; // Approximate chars that fit in column
            const displayText = cellText.length > maxChars ? 
                              cellText.substring(0, maxChars - 3) + '...' : cellText;
            
            doc.text(displayText, marginSize + (j * colWidth) + 2, startY + 7);
          });
          
          startY += rowHeight;
          
          // Check if we need a new page
          if (startY > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            startY = 20;
          }
        }
      }
      
      return startY + 10; // Return the new Y position
    } catch (error) {
      console.error("Error in manual table drawing:", error);
      doc.setTextColor(255, 0, 0);
      doc.text(`Error drawing table: ${error instanceof Error ? error.message : String(error)}`, marginSize, startY + 10);
      return startY + 20;
    }
  }
}
