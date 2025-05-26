
import { auth } from '@/integrations/firebase/client';
import { 
  multiFactor, 
  PhoneAuthProvider, 
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  PhoneAuthCredential
} from 'firebase/auth';
import { User } from 'firebase/auth';

export class MFAUtils {
  // Generate backup codes
  static generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
  }

  // Send verification code to phone
  static async sendVerificationCode(
    firebaseUser: User, 
    phoneNumber: string
  ): Promise<string> {
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    });

    const phoneAuthProvider = new PhoneAuthProvider(auth);
    
    // Use correct API - pass phone number directly, not as object
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    );
    
    return verificationId;
  }

  // Setup phone MFA with verification code
  static async setupPhoneMFA(
    firebaseUser: User, 
    verificationId: string, 
    verificationCode: string
  ): Promise<void> {
    // Get the multi-factor session first
    const multiFactorSession = await multiFactor(firebaseUser).getSession();
    
    // Create phone auth credential
    const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
    
    // Create the MFA assertion from the credential
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
    
    // Enroll the MFA factor with the assertion and session
    await multiFactor(firebaseUser).enroll(multiFactorAssertion, multiFactorSession);
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
}
