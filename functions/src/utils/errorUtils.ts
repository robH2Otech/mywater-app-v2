
import { HttpsError } from 'firebase-functions/v2/https';

export class BusinessUserError extends Error {
  constructor(
    public code: string,
    message: string,
    public details: any = {},
    public context: string = ''
  ) {
    super(message);
    this.name = 'BusinessUserError';
  }
}

export const createHttpsError = (error: BusinessUserError): HttpsError => {
  const errorCode = getFirebaseErrorCode(error.code);
  return new HttpsError(errorCode, error.message, {
    code: error.code,
    details: error.details,
    context: error.context
  });
};

const getFirebaseErrorCode = (code: string): any => {
  switch (code) {
    case 'UNAUTHENTICATED':
      return 'unauthenticated';
    case 'PERMISSION_DENIED':
      return 'permission-denied';
    case 'VALIDATION_ERROR':
      return 'invalid-argument';
    case 'INTERNAL':
      return 'internal';
    default:
      return 'unknown';
  }
};

export const logFunctionStart = (functionName: string, data: any, context: any) => {
  console.log(`[${functionName}] Function started`, {
    data: data ? Object.keys(data) : 'no data',
    user: context?.uid || 'no user'
  });
};

export const logFunctionSuccess = (functionName: string, result: any) => {
  console.log(`[${functionName}] Function completed successfully`, { result });
};

export const logFunctionError = (functionName: string, error: any) => {
  console.error(`[${functionName}] Function failed`, { error: error.message || error });
};
