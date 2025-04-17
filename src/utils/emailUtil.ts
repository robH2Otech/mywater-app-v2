
// Re-export all email utility functions from the main email file
export {
  sendEmailDirect,
  initEmailJS,
  EMAILJS_CONFIG,
  sendEmailWithEmailJS,
  generateReferralEmailTemplate,
  processPendingEmails,
  sendReferralEmail,
  processPendingEmailsForUI
} from './email';
