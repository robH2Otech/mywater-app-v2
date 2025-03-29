
// This file is kept for backward compatibility
// Re-export all email utility functions from the new files
export {
  sendEmailWithEmailJS,
  EMAILJS_CONFIG,
  generateReferralEmailTemplate,
  sendEmailDirect,
  processPendingEmails,
  sendReferralEmail
} from './email';
