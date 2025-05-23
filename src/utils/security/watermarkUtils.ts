
import { auth } from "@/integrations/firebase/client";
import { logAuditEvent } from "@/utils/auth/securityUtils";

/**
 * Adds a secure digital watermark to exported data
 * This helps trace data leaks and unauthorized sharing
 */
export const addSecurityWatermark = async (data: any, exportType: string): Promise<any> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to export data");
    }
    
    // Get current user claims
    const idTokenResult = await user.getIdTokenResult();
    const role = idTokenResult.claims.role as string;
    const company = idTokenResult.claims.company as string;
    
    // Generate watermark ID
    const watermarkId = generateWatermarkId();
    
    // Create timestamp
    const timestamp = new Date().toISOString();
    
    // Log export in audit trail
    logAuditEvent('data_export', {
      exportType,
      watermarkId,
      timestamp,
      dataSize: typeof data === 'string' ? data.length : JSON.stringify(data).length
    });
    
    // Different watermarking techniques based on export type
    if (exportType === 'pdf') {
      // For PDFs: Add visible and invisible watermarks
      return {
        ...data,
        _watermark: {
          id: watermarkId,
          user: user.email,
          company,
          timestamp,
          visibleText: `Exported by ${user.email} (${role}) at ${new Date().toLocaleString()}`
        }
      };
    } else if (exportType === 'csv' || exportType === 'excel') {
      // For tabular data: Add metadata rows
      return {
        metadata: {
          watermarkId,
          exportedBy: user.email,
          role,
          company,
          timestamp,
          disclaimer: "This data is confidential and for authorized use only."
        },
        data
      };
    } else if (exportType === 'json') {
      // For JSON: Embed watermark in data structure
      return {
        _security: {
          watermarkId,
          exportedBy: user.email,
          role,
          company,
          timestamp
        },
        ...data
      };
    } else {
      // Default watermarking
      return {
        data,
        watermark: {
          id: watermarkId,
          user: user.email,
          company,
          timestamp
        }
      };
    }
  } catch (error) {
    console.error("Error adding security watermark:", error);
    throw new Error("Failed to secure exported data");
  }
};

/**
 * Generates a unique ID for watermarking exports
 */
const generateWatermarkId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `xw-${timestamp}-${randomPart}`;
};

/**
 * Checks if the current user is allowed to export data
 */
export const canExportData = async (exportType: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    // Get current user claims
    const idTokenResult = await user.getIdTokenResult();
    const role = idTokenResult.claims.role as string;
    
    // Define which roles can export which data types
    const exportPermissions: Record<string, string[]> = {
      'report': ['technician', 'admin', 'superadmin'],
      'user_data': ['admin', 'superadmin'],
      'financial': ['admin', 'superadmin'],
      'system': ['superadmin']
    };
    
    // Check if user has permission
    const allowedRoles = exportPermissions[exportType] || ['superadmin'];
    const hasPermission = allowedRoles.includes(role);
    
    // Log export attempt
    logAuditEvent('export_attempt', {
      exportType,
      granted: hasPermission,
      role
    });
    
    return hasPermission;
  } catch (error) {
    console.error("Error checking export permissions:", error);
    return false;
  }
};
