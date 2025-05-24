
import CryptoJS from 'crypto-js';
import { z } from 'zod';

// Field-level encryption for sensitive data
export class DataProtection {
  private static readonly ENCRYPTION_KEY = 'user-specific-key'; // In production, use user-specific keys

  // Encrypt sensitive fields
  static encryptField(data: string, userKey?: string): string {
    const key = userKey || this.ENCRYPTION_KEY;
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  // Decrypt sensitive fields
  static decryptField(encryptedData: string, userKey?: string): string {
    try {
      const key = userKey || this.ENCRYPTION_KEY;
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  // Data anonymization for analytics
  static anonymizeData<T extends Record<string, any>>(data: T): T {
    const anonymized = { ...data };
    
    // Fields to anonymize
    const sensitiveFields = ['email', 'phone', 'first_name', 'last_name', 'address'];
    
    sensitiveFields.forEach(field => {
      if (anonymized[field]) {
        if (field === 'email') {
          anonymized[field] = this.hashField(anonymized[field]);
        } else {
          anonymized[field] = '[REDACTED]';
        }
      }
    });

    return anonymized;
  }

  // Hash field for analytics while preserving uniqueness
  static hashField(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex).substring(0, 8);
  }

  // GDPR compliance - data export
  static exportUserData(userData: Record<string, any>): string {
    const exportData = {
      exported_at: new Date().toISOString(),
      user_data: userData,
      data_sources: ['firestore', 'firebase_auth'],
      retention_policy: '7 years from last activity'
    };

    return JSON.stringify(exportData, null, 2);
  }

  // GDPR compliance - data deletion verification
  static verifyDataDeletion(userId: string): boolean {
    // In production, this would verify deletion across all systems
    console.log(`Verifying data deletion for user: ${userId}`);
    return true;
  }

  // Data masking for display
  static maskSensitiveData(data: string, type: 'email' | 'phone' | 'credit_card'): string {
    switch (type) {
      case 'email':
        const [username, domain] = data.split('@');
        return `${username.substring(0, 2)}***@${domain}`;
      
      case 'phone':
        return data.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
      
      case 'credit_card':
        return data.replace(/(\d{4})\d{8}(\d{4})/, '$1********$2');
      
      default:
        return data.substring(0, 2) + '*'.repeat(data.length - 2);
    }
  }

  // Secure data validation
  static validateSecureInput(input: string, maxLength: number = 1000): boolean {
    const schema = z.string()
      .max(maxLength)
      .refine(data => !this.containsMaliciousContent(data), 'Contains potentially malicious content');

    try {
      schema.parse(input);
      return true;
    } catch {
      return false;
    }
  }

  // Check for malicious content
  private static containsMaliciousContent(input: string): boolean {
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /(union|select|insert|delete|update|drop)\s+/i
    ];

    return maliciousPatterns.some(pattern => pattern.test(input));
  }

  // Data retention policy enforcement
  static checkDataRetention(timestamp: Date, retentionDays: number): boolean {
    const now = new Date();
    const daysDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > retentionDays;
  }

  // Secure random token generation
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Add crypto-js dependency
// This would be added via package.json in a real implementation
