
import { usePermissions } from "@/hooks/usePermissions";

// Utility type for data with company information
export interface CompanyData {
  company?: string;
  company_id?: string;
  companyId?: string;
}

// Hook for filtering data based on user permissions
export function useDataFiltering() {
  const { isSuperAdmin, company, canViewData } = usePermissions();

  // Filter array of data based on company access
  const filterByCompany = <T extends CompanyData>(data: T[]): T[] => {
    if (isSuperAdmin()) {
      return data; // Superadmins see all data
    }

    return data.filter(item => {
      const itemCompany = item.company || item.company_id || item.companyId;
      return canViewData(itemCompany || null);
    });
  };

  // Check if user can access specific data item
  const canAccessItem = <T extends CompanyData>(item: T): boolean => {
    if (isSuperAdmin()) {
      return true;
    }

    const itemCompany = item.company || item.company_id || item.companyId;
    return canViewData(itemCompany || null);
  };

  // Add company_id to new data items
  const addCompanyToData = <T extends Record<string, any>>(data: T): T & { company_id: string } => {
    if (isSuperAdmin()) {
      // For superadmins, require explicit company specification
      return { ...data, company_id: data.company_id || company || 'default-company' };
    }

    // For other users, automatically use their company
    return { ...data, company_id: company || 'default-company' };
  };

  // Build query filters for database operations
  const getCompanyFilter = () => {
    if (isSuperAdmin()) {
      return {}; // No filter for superadmins
    }

    return {
      company_id: company || 'default-company'
    };
  };

  return {
    filterByCompany,
    canAccessItem,
    addCompanyToData,
    getCompanyFilter,
    currentCompany: company,
    isGlobalAccess: isSuperAdmin()
  };
}

// Utility functions for common filtering operations
export const filterUnitsByCompany = <T extends CompanyData>(units: T[], userCompany: string | null, isSuperAdmin: boolean): T[] => {
  if (isSuperAdmin) return units;
  
  return units.filter(unit => {
    const unitCompany = unit.company || unit.company_id || unit.companyId;
    return !unitCompany || unitCompany === userCompany;
  });
};

export const filterAlertsByCompany = <T extends CompanyData>(alerts: T[], userCompany: string | null, isSuperAdmin: boolean): T[] => {
  if (isSuperAdmin) return alerts;
  
  return alerts.filter(alert => {
    const alertCompany = alert.company || alert.company_id || alert.companyId;
    return !alertCompany || alertCompany === userCompany;
  });
};

export const filterMeasurementsByCompany = <T extends CompanyData>(measurements: T[], userCompany: string | null, isSuperAdmin: boolean): T[] => {
  if (isSuperAdmin) return measurements;
  
  return measurements.filter(measurement => {
    const measurementCompany = measurement.company || measurement.company_id || measurement.companyId;
    return !measurementCompany || measurementCompany === userCompany;
  });
};
