
import { z } from "zod";

// XSS Protection utility
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/&/g, '&amp;')
    .trim();
};

// Input validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(5, 'Email too short')
  .max(255, 'Email too long')
  .transform(sanitizeInput);

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters')
  .transform(sanitizeInput);

export const companySchema = z.string()
  .min(1, 'Company is required')
  .max(100, 'Company name too long')
  .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Company name contains invalid characters')
  .transform(sanitizeInput);

export const roleSchema = z.enum(['superadmin', 'admin', 'technician', 'user']);

export const unitNameSchema = z.string()
  .min(1, 'Unit name is required')
  .max(100, 'Unit name too long')
  .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Unit name contains invalid characters')
  .transform(sanitizeInput);

export const measurementValueSchema = z.number()
  .min(0, 'Measurement value cannot be negative')
  .max(1000000, 'Measurement value too large')
  .finite('Measurement value must be a valid number');

export const textContentSchema = z.string()
  .max(5000, 'Content too long')
  .transform(sanitizeInput);

// User creation validation
export const createUserSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  company: companySchema,
  role: roleSchema,
  job_title: z.string().max(100).optional().transform(val => val ? sanitizeInput(val) : val),
  phone: z.string().max(20).optional().transform(val => val ? sanitizeInput(val) : val)
});

// Unit creation validation
export const createUnitSchema = z.object({
  name: unitNameSchema,
  location: z.string().max(200).optional().transform(val => val ? sanitizeInput(val) : val),
  unit_type: z.string().max(50).optional().transform(val => val ? sanitizeInput(val) : val),
  company_id: companySchema
});

// Request validation
export const createRequestSchema = z.object({
  title: z.string().min(1).max(200).transform(sanitizeInput),
  description: textContentSchema,
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  company_id: companySchema
});

// Comment validation
export const commentSchema = z.object({
  content: textContentSchema.min(1, 'Comment cannot be empty')
});

// Validate and sanitize user input
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new Error(`Validation error: ${firstError.message}`);
    }
    throw new Error('Invalid input data');
  }
};

// Rate limiting utilities
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);
  
  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userRequests.count >= maxRequests) {
    return false;
  }
  
  userRequests.count++;
  return true;
};

// SQL injection prevention (for any raw queries)
export const sanitizeForSQL = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/g, '')
    .replace(/sp_/g, '')
    .trim();
};

// File upload validation
export const validateFileUpload = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large');
  }
  
  return true;
};
