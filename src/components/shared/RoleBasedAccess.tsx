
import { ReactNode } from 'react';
import { UserRole } from '@/types/users';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

interface RoleBasedAccessProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleBasedAccess({ allowedRoles, children, fallback = null }: RoleBasedAccessProps) {
  const { userRole, isLoading } = useFirebaseAuth();
  
  if (isLoading) {
    return <div className="animate-pulse bg-spotify-accent/20 h-20 rounded"></div>;
  }
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export function AdminOnly({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={["admin", "superadmin"]} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function SuperAdminOnly({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={["superadmin"]} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function TechnicianAndAbove({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={["technician", "admin", "superadmin"]} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}
