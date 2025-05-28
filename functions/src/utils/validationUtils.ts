
import { BusinessUserError } from './errorUtils';

export interface CreateUserValidation {
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  role: string;
  password: string;
  phone?: string;
  job_title?: string;
  status?: string;
}

export const validateCreateUserData = (data: any): CreateUserValidation => {
  const errors: string[] = [];

  // Required fields
  if (!data.first_name || typeof data.first_name !== 'string') {
    errors.push('first_name is required and must be a string');
  }
  if (!data.last_name || typeof data.last_name !== 'string') {
    errors.push('last_name is required and must be a string');
  }
  if (!data.email || typeof data.email !== 'string') {
    errors.push('email is required and must be a string');
  }
  if (!data.company || typeof data.company !== 'string') {
    errors.push('company is required and must be a string');
  }
  if (!data.role || typeof data.role !== 'string') {
    errors.push('role is required and must be a string');
  }
  if (!data.password || typeof data.password !== 'string') {
    errors.push('password is required and must be a string');
  }

  // Email validation
  if (data.email && !isValidEmail(data.email)) {
    errors.push('email must be a valid email address');
  }

  // Role validation
  const validRoles = ['superadmin', 'admin', 'technician', 'user'];
  if (data.role && !validRoles.includes(data.role)) {
    errors.push(`role must be one of: ${validRoles.join(', ')}`);
  }

  // Status validation
  if (data.status) {
    const validStatuses = ['active', 'inactive', 'pending'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // Password validation
  if (data.password && data.password.length < 6) {
    errors.push('password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    throw new BusinessUserError('VALIDATION_ERROR', `Validation failed: ${errors.join(', ')}`, { errors }, 'validation');
  }

  return {
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
    email: data.email.trim().toLowerCase(),
    company: data.company.trim(),
    role: data.role,
    password: data.password,
    phone: data.phone ? data.phone.trim() : '',
    job_title: data.job_title ? data.job_title.trim() : '',
    status: data.status || 'active'
  };
};

export const validateCallerPermissions = (callerClaims: any, targetRole: string): void => {
  if (!callerClaims.role) {
    throw new BusinessUserError('PERMISSION_DENIED', 'Caller has no role assigned', { callerClaims }, 'permission_check');
  }

  const callerRole = callerClaims.role;

  // Only superadmin and admin can create users
  if (!['superadmin', 'admin'].includes(callerRole)) {
    throw new BusinessUserError('PERMISSION_DENIED', 'Only admins can create users', { callerRole }, 'permission_check');
  }

  // Admin can only create technician and user roles
  if (callerRole === 'admin' && !['technician', 'user'].includes(targetRole)) {
    throw new BusinessUserError('PERMISSION_DENIED', `Admins cannot create ${targetRole} users`, { callerRole, targetRole }, 'permission_check');
  }
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
