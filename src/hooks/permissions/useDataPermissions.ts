
import { useAuth } from "@/contexts/AuthContext";
import { logAuditEvent } from "@/utils/auth/securityUtils";
import { useRolePermissions } from "./useRolePermissions";

export function useDataPermissions() {
  const { company, canAccessAllCompanies } = useAuth();
  const { hasRole, isSuperAdmin } = useRolePermissions();

  // Enhanced data view permission with company filtering
  const canViewData = (dataCompany: string | null, dataType: string = 'general'): boolean => {
    const hasAccess = determineAccess(dataCompany);
    
    // Log access attempts for sensitive data
    if (dataType === 'sensitive' || dataType === 'financial') {
      logAuditEvent('data_access_check', {
        dataType,
        dataCompany,
        userCompany: company,
        userRole: null,
        accessGranted: hasAccess
      });
    }
    
    return hasAccess;
  };
  
  // Helper function to determine company-based access
  const determineAccess = (dataCompany: string | null): boolean => {
    if (!dataCompany) return true;
    if (canAccessAllCompanies()) return true;
    return company === dataCompany;
  };

  // Check if user can perform CRUD operations
  const canCreate = (): boolean => {
    return hasRole(['superadmin', 'admin', 'technician']);
  };

  const canUpdate = (): boolean => {
    return hasRole(['superadmin', 'admin', 'technician']);
  };

  const canDeleteData = (): boolean => {
    return hasRole(['superadmin', 'admin']);
  };

  // Check if user can access cross-company data (superadmin only)
  const canAccessCrossCompany = (): boolean => {
    return isSuperAdmin();
  };

  // Check if user can export data
  const canExportData = (): boolean => {
    return hasRole(['admin', 'superadmin']);
  };

  // Check if user should see read-only mode
  const isReadOnlyMode = (): boolean => {
    return hasRole(['user']); // Only regular users have read-only access
  };

  // Filter data based on company access
  const filterDataByCompany = <T extends { company?: string; company_id?: string }>(data: T[]): T[] => {
    if (isSuperAdmin()) {
      return data; // Superadmins see all data
    }
    
    return data.filter(item => {
      const itemCompany = item.company || item.company_id;
      return !itemCompany || itemCompany === company;
    });
  };

  return {
    canViewData,
    canCreate,
    canUpdate,
    canDeleteData,
    canAccessCrossCompany,
    canExportData,
    isReadOnlyMode,
    filterDataByCompany
  };
}
