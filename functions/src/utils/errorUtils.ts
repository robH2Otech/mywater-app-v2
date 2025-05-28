
import { HttpsError } from 'firebase-functions/v2/https';

export interface FunctionError {
  code: string;
  message: string;
  details?: any;
  step?: string;
}

export class BusinessUserError extends Error {
  public code: string;
  public details?: any;
  public step?: string;

  constructor(code: string, message: string, details?: any, step?: string) {
    super(message);
    this.name = 'BusinessUserError';
    this.code = code;
    this.details = details;
    this.step = step;
  }
}

// Define a type for Firebase HTTPS error codes
type HttpsErrorCode = 
  | 'ok' 
  | 'cancelled' 
  | 'unknown' 
  | 'invalid-argument' 
  | 'deadline-exceeded' 
  | 'not-found' 
  | 'already-exists' 
  | 'permission-denied' 
  | 'resource-exhausted' 
  | 'failed-precondition' 
  | 'aborted' 
  | 'out-of-range' 
  | 'unimplemented' 
  | 'internal' 
  | 'unavailable' 
  | 'data-loss' 
  | 'unauthenticated';

export function createHttpsError(error: BusinessUserError | Error): HttpsError {
  if (error instanceof BusinessUserError) {
    console.error(`Business User Error [${error.code}] at step [${error.step}]:`, {
      message: error.message,
      details: error.details,
      stack: error.stack
    });

    // Map business error codes to HTTPS error codes
    const httpsErrorCode = mapErrorCode(error.code);
    return new HttpsError(httpsErrorCode, error.message, {
      code: error.code,
      step: error.step,
      details: error.details
    });
  }

  console.error('Unexpected error:', error);
  return new HttpsError('internal', 'An unexpected error occurred', {
    message: error.message
  });
}

const mapErrorCode = (code: string): HttpsErrorCode => {
  switch (code) {
    case 'INVALID_ARGUMENT':
    case 'VALIDATION_ERROR':
      return 'invalid-argument';
    case 'PERMISSION_DENIED':
      return 'permission-denied';
    case 'UNAUTHENTICATED':
      return 'unauthenticated';
    case 'NOT_FOUND':
      return 'not-found';
    case 'ALREADY_EXISTS':
      return 'already-exists';
    default:
      return 'internal';
  }
};

export function logFunctionStart(functionName: string, data: any, context: any): void {
  console.log(`=== ${functionName} START ===`, {
    timestamp: new Date().toISOString(),
    caller: context?.auth?.uid || 'anonymous',
    callerRole: context?.auth?.token?.role || 'no-role',
    data: sanitizeLogData(data)
  });
}

export function logFunctionStep(step: string, data?: any): void {
  console.log(`STEP: ${step}`, data ? sanitizeLogData(data) : '');
}

export function logFunctionSuccess(functionName: string, result: any): void {
  console.log(`=== ${functionName} SUCCESS ===`, {
    timestamp: new Date().toISOString(),
    result: sanitizeLogData(result)
  });
}

export function logFunctionError(functionName: string, error: any, step?: string): void {
  console.error(`=== ${functionName} ERROR ===`, {
    timestamp: new Date().toISOString(),
    step,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    }
  });
}

function sanitizeLogData(data: any): any {
  if (!data) return data;
  
  const sanitized = { ...data };
  
  // Remove sensitive fields
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.token) sanitized.token = '[REDACTED]';
  
  return sanitized;
}
