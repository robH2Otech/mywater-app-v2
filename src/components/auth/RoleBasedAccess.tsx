
import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/users';

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
  company?: string;
  fallback?: ReactNode;
  requireCompanyMatch?: boolean;
}

export function RoleBasedAccess({
  children,
  allowedRoles = [],
  requiredPermission,
  company,
  fallback = null,
  requireCompanyMatch = false
}: RoleBasedAccessProps) {
  const { 
    userRole, 
    hasRole, 
    canViewData, 
    company: userCompany,
    isSuperAdmin
  } = usePermissions();

  // Check role-based access
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  // Check permission-based access
  if (requiredPermission && !canViewData(company)) {
    return <>{fallback}</>;
  }

  // Check company-based access (unless user is superadmin)
  if (requireCompanyMatch && company && !isSuperAdmin() && userCompany !== company) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Specific role-based wrapper components for common use cases
export function SuperAdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['superadmin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['superadmin', 'admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function TechnicianAndAbove({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['superadmin', 'admin', 'technician']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function ReadOnlyForUsers({ children, readOnlyContent }: { children: ReactNode; readOnlyContent: ReactNode }) {
  const { isCompanyUser } = usePermissions();
  
  if (isCompanyUser()) {
    return <>{readOnlyContent}</>;
  }
  
  return <>{children}</>;
}
