
import { auth } from '@/integrations/firebase/client';
import { 
  multiFactor, 
  PhoneAuthProvider, 
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  PhoneAuthCredential,
  ApplicationVerifier
} from 'firebase/auth';
import { User } from 'firebase/auth';

export class MFAUtils {
  private static recaptchaVerifier: RecaptchaVerifier | null = null;

  // Generate backup codes
  static generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
  }

  // Initialize reCAPTCHA verifier
  static initializeRecaptcha(): ApplicationVerifier {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }
    
    this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });
    
    return this.recaptchaVerifier;
  }

  // Send verification code to phone
  static async sendVerificationCode(
    firebaseUser: User, 
    phoneNumber: string
  ): Promise<string> {
    try {
      // Clean up any existing verifier
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
      }

      // Initialize new reCAPTCHA verifier
      const recaptchaVerifier = this.initializeRecaptcha();
      
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      
      // Use correct API - pass phone number directly
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier
      );
      
      return verificationId;
    } catch (error) {
      console.error('Error sending verification code:', error);
      // Clean up verifier on error
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
      throw error;
    }
  }

  // Setup phone MFA with verification code - Fixed for Firebase v10
  static async setupPhoneMFA(
    firebaseUser: User, 
    verificationId: string, 
    verificationCode: string
  ): Promise<void> {
    try {
      // Get the multi-factor session first
      const multiFactorSession = await multiFactor(firebaseUser).getSession();
      
      // Create phone auth credential
      const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
      
      // Create the MFA assertion from the credential
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      
      // Enroll the MFA factor - Fixed API call for Firebase v10
      await multiFactor(firebaseUser).enroll(multiFactorAssertion, multiFactorSession);
      
      // Clean up verifier after successful enrollment
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
    } catch (error) {
      console.error('Error setting up phone MFA:', error);
      // Clean up verifier on error
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
      throw error;
    }
  }

  // Verify MFA during sign-in
  static async verifyMFADuringSignIn(
    resolver: any,
    verificationId: string,
    verificationCode: string,
    factorId: string
  ): Promise<any> {
    try {
      const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      
      // Resolve the sign-in with MFA
      const userCredential = await resolver.resolveSignIn(multiFactorAssertion);
      return userCredential;
    } catch (error) {
      console.error('Error verifying MFA during sign-in:', error);
      throw error;
    }
  }

  // Check if MFA is required for user role
  static isMFARequired(userRole: string): boolean {
    return userRole === 'admin' || userRole === 'superadmin';
  }

  // Get enrolled MFA factors
  static getEnrolledFactors(firebaseUser: User): string[] {
    const factors = multiFactor(firebaseUser).enrolledFactors;
    return factors.map(factor => factor.factorId);
  }

  // Check if user has MFA enabled
  static hasMFAEnabled(firebaseUser: User): boolean {
    return multiFactor(firebaseUser).enrolledFactors.length > 0;
  }

  // Clean up resources
  static cleanup(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }

  // Format phone number for international use
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add + prefix if not present and number doesn't start with country code
    if (!phoneNumber.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return phoneNumber;
  }

  // Validate phone number format
  static validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }
}
