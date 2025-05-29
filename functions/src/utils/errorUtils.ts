
import { logger } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';

export class BusinessUserError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details: any = {},
    public step?: string
  ) {
    super(message);
    this.name = 'BusinessUserError';
  }
}

export function createHttpsError(error: BusinessUserError): HttpsError {
  const code = mapErrorCode(error.code);
  return new HttpsError(code, error.message, {
    code: error.code,
    details: error.details,
    step: error.step
  });
}

function mapErrorCode(businessCode: string): 'ok' | 'cancelled' | 'unknown' | 'invalid-argument' | 'deadline-exceeded' | 'not-found' | 'already-exists' | 'permission-denied' | 'resource-exhausted' | 'failed-precondition' | 'aborted' | 'out-of-range' | 'unimplemented' | 'internal' | 'unavailable' | 'data-loss' | 'unauthenticated' {
  switch (businessCode) {
    case 'UNAUTHENTICATED':
      return 'unauthenticated';
    case 'PERMISSION_DENIED':
      return 'permission-denied';
    case 'NOT_FOUND':
      return 'not-found';
    case 'VALIDATION_ERROR':
      return 'invalid-argument';
    case 'ALREADY_EXISTS':
      return 'already-exists';
    case 'INTERNAL':
    default:
      return 'internal';
  }
}

export function logFunctionStart(functionName: string, data: any, context: any): void {
  logger.info(`${functionName} started`, {
    function: functionName,
    userId: context?.uid || 'anonymous',
    data: sanitizeLogData(data)
  });
}

export function logFunctionStep(step: string, data: any = {}): void {
  logger.info(`Function step: ${step}`, sanitizeLogData(data));
}

export function logFunctionSuccess(functionName: string, result: any): void {
  logger.info(`${functionName} completed successfully`, {
    function: functionName,
    result: sanitizeLogData(result)
  });
}

export function logFunctionError(functionName: string, error: any): void {
  logger.error(`${functionName} failed`, {
    function: functionName,
    error: error.message,
    stack: error.stack,
    code: error.code
  });
}

function sanitizeLogData(data: any): any {
  if (!data) return data;
  
  // Remove sensitive fields
  const sanitized = { ...data };
  if (sanitized.password) delete sanitized.password;
  if (sanitized.token) delete sanitized.token;
  if (sanitized.secret) delete sanitized.secret;
  
  return sanitized;
}
