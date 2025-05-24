
import { auth } from '@/integrations/firebase/client';
import { validateInput } from './inputValidation';
import { logAuditEvent } from '@/utils/auth/securityUtils';
import { z } from 'zod';

interface SecureRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  requireAuth?: boolean;
  validateResponse?: boolean;
  rateLimitKey?: string;
}

class SecureApiClient {
  private baseURL: string;
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  // Rate limiting check
  private checkRateLimit(key: string, maxRequests: number = 100): boolean {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const userRequests = this.requestCounts.get(key);

    if (!userRequests || now > userRequests.resetTime) {
      this.requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userRequests.count >= maxRequests) {
      return false;
    }

    userRequests.count++;
    return true;
  }

  // Get authenticated headers
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Validate token claims
  private async validateTokenClaims(): Promise<{ role: string; company: string }> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const tokenResult = await user.getIdTokenResult();
    const role = tokenResult.claims.role as string;
    const company = tokenResult.claims.company as string;

    if (!role) {
      throw new Error('User has no valid role claims');
    }

    return { role, company };
  }

  // Secure request method
  async secureRequest<T>(
    endpoint: string, 
    options: SecureRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      data,
      requireAuth = true,
      validateResponse = true,
      rateLimitKey
    } = options;

    try {
      // Rate limiting
      if (rateLimitKey && !this.checkRateLimit(rateLimitKey)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Authentication check
      if (requireAuth) {
        await this.validateTokenClaims();
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (requireAuth) {
        const authHeaders = await this.getAuthHeaders();
        Object.assign(headers, authHeaders);
      }

      // Validate and sanitize request data
      let sanitizedData;
      if (data && method !== 'GET') {
        // Apply basic sanitization to string fields
        sanitizedData = this.sanitizeRequestData(data);
      }

      // Make the request
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: sanitizedData ? JSON.stringify(sanitizedData) : undefined,
      });

      // Log the request for audit trail
      await this.logRequest(endpoint, method, response.status, requireAuth);

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} ${errorText}`);
      }

      // Parse response
      const responseData = await response.json();

      // Validate response if needed
      if (validateResponse) {
        this.sanitizeResponseData(responseData);
      }

      return responseData;

    } catch (error) {
      // Log security incidents
      await this.logSecurityIncident(endpoint, method, error);
      throw error;
    }
  }

  // Sanitize request data
  private sanitizeRequestData(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/[<>]/g, '');
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeRequestData(item));
    }

    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeRequestData(value);
      }
      return sanitized;
    }

    return data;
  }

  // Sanitize response data
  private sanitizeResponseData(data: any): void {
    // Basic XSS protection for response data
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          data[key] = value.replace(/[<>]/g, '');
        } else if (typeof value === 'object') {
          this.sanitizeResponseData(value);
        }
      }
    }
  }

  // Log requests for audit trail
  private async logRequest(
    endpoint: string, 
    method: string, 
    status: number, 
    requireAuth: boolean
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      await logAuditEvent('api_request', {
        endpoint,
        method,
        status,
        requireAuth,
        user_id: user?.uid || 'anonymous',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('Failed to log request:', error);
    }
  }

  // Log security incidents
  private async logSecurityIncident(
    endpoint: string, 
    method: string, 
    error: any
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      await logAuditEvent('security_incident', {
        type: 'api_request_failed',
        endpoint,
        method,
        error: error.message,
        user_id: user?.uid || 'anonymous',
        timestamp: new Date().toISOString()
      }, 'warning');
    } catch (logError) {
      console.error('Failed to log security incident:', logError);
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, options?: Omit<SecureRequestOptions, 'method'>): Promise<T> {
    return this.secureRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data: any, options?: Omit<SecureRequestOptions, 'method' | 'data'>): Promise<T> {
    return this.secureRequest<T>(endpoint, { ...options, method: 'POST', data });
  }

  async put<T>(endpoint: string, data: any, options?: Omit<SecureRequestOptions, 'method' | 'data'>): Promise<T> {
    return this.secureRequest<T>(endpoint, { ...options, method: 'PUT', data });
  }

  async delete<T>(endpoint: string, options?: Omit<SecureRequestOptions, 'method'>): Promise<T> {
    return this.secureRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export a singleton instance
export const secureApiClient = new SecureApiClient();

// Schema-based API request helpers
export const createSecureApiCall = <TInput, TOutput>(
  endpoint: string,
  inputSchema: z.ZodSchema<TInput>,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
) => {
  return async (data: TInput): Promise<TOutput> => {
    // Validate input
    const validatedData = validateInput(inputSchema, data);
    
    // Make secure request
    return secureApiClient.secureRequest<TOutput>(endpoint, {
      method,
      data: validatedData,
      rateLimitKey: `${endpoint}_${method}`
    });
  };
};
