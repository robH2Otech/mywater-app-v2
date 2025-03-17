
import { jsPDF } from "jspdf";

/**
 * Draws a table manually in the PDF when autoTable fails
 */
export const drawTableManually = (
  doc: jsPDF, 
  data: any[], 
  headers: string[], 
  startY: number, 
  title: string
): number => {
  console.log(`Drawing table manually: ${title} with ${data.length} rows`);
  
  try {
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginSize = 14; // Define margin variable here
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
    const marginSize = 14; // Define margin variable for the error case too
    doc.text(`Error drawing table: ${error instanceof Error ? error.message : String(error)}`, marginSize, startY + 10);
    return startY + 20;
  }
};
