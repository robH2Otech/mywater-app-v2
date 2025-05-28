
import { BusinessUserError } from './errorUtils';

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: string;
  job_title?: string;
  role: 'superadmin' | 'admin' | 'technician' | 'user';
  status: 'active' | 'inactive';
  password: string;
}

export function validateCreateUserData(data: any): CreateUserData {
  if (!data || typeof data !== 'object') {
    throw new BusinessUserError('VALIDATION_ERROR', 'Invalid user data provided', {}, 'input_validation');
  }

  const { first_name, last_name, email, phone, company, job_title, role, status, password } = data;

  // Required field validation
  if (!first_name || typeof first_name !== 'string' || first_name.trim().length === 0) {
    throw new BusinessUserError('VALIDATION_ERROR', 'First name is required', { field: 'first_name' }, 'input_validation');
  }

  if (!last_name || typeof last_name !== 'string' || last_name.trim().length === 0) {
    throw new BusinessUserError('VALIDATION_ERROR', 'Last name is required', { field: 'last_name' }, 'input_validation');
  }

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    throw new BusinessUserError('VALIDATION_ERROR', 'Valid email is required', { field: 'email' }, 'input_validation');
  }

  if (!company || typeof company !== 'string' || company.trim().length === 0) {
    throw new BusinessUserError('VALIDATION_ERROR', 'Company is required', { field: 'company' }, 'input_validation');
  }

  if (!role || !['superadmin', 'admin', 'technician', 'user'].includes(role)) {
    throw new BusinessUserError('VALIDATION_ERROR', 'Valid role is required', { field: 'role', validRoles: ['superadmin', 'admin', 'technician', 'user'] }, 'input_validation');
  }

  if (!status || !['active', 'inactive'].includes(status)) {
    throw new BusinessUserError('VALIDATION_ERROR', 'Valid status is required', { field: 'status', validStatuses: ['active', 'inactive'] }, 'input_validation');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new BusinessUserError('VALIDATION_ERROR', 'Password must be at least 6 characters', { field: 'password' }, 'input_validation');
  }

  return {
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : undefined,
    company: company.trim(),
    job_title: job_title ? job_title.trim() : undefined,
    role,
    status,
    password
  };
}

export function validateCallerPermissions(callerClaims: any, targetRole: string): void {
  if (!callerClaims || !callerClaims.role) {
    throw new BusinessUserError('PERMISSION_DENIED', 'Caller must have a valid role', { callerClaims }, 'permission_validation');
  }

  const callerRole = callerClaims.role;

  // Role hierarchy validation
  const roleHierarchy = {
    'superadmin': 4,
    'admin': 3,
    'technician': 2,
    'user': 1
  };

  const callerLevel = roleHierarchy[callerRole as keyof typeof roleHierarchy] || 0;
  const targetLevel = roleHierarchy[targetRole as keyof typeof roleHierarchy] || 0;

  if (callerLevel === 0) {
    throw new BusinessUserError('PERMISSION_DENIED', 'Invalid caller role', { callerRole }, 'permission_validation');
  }

  if (targetLevel === 0) {
    throw new BusinessUserError('VALIDATION_ERROR', 'Invalid target role', { targetRole }, 'permission_validation');
  }

  // Only allow creating users with equal or lower privileges
  if (callerLevel < targetLevel) {
    throw new BusinessUserError('PERMISSION_DENIED', `Role ${callerRole} cannot create users with role ${targetRole}`, { callerRole, targetRole }, 'permission_validation');
  }

  // Additional business rules
  if (targetRole === 'superadmin' && callerRole !== 'superadmin') {
    throw new BusinessUserError('PERMISSION_DENIED', 'Only superadmins can create other superadmins', { callerRole, targetRole }, 'permission_validation');
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
