
/**
 * Main PDF Generator module that re-exports all PDF generation functionality
 */

// Re-export all PDF generation functions from the split files
export { generateVisualPDF } from './visualPDFGenerator';
export { generateTabularPDF } from './tabularPDFGenerator';
export { drawTableManually } from './tableUtils';
export type { ReportMetrics } from './types';

// This file serves as the main entry point for all PDF generation functionality
// The actual implementation has been split into smaller, more focused files
