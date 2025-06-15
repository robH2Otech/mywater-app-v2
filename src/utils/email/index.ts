// Re-export from the working email configuration
export { 
  sendEmailWithEmailJS as sendEmail, 
  initEmailJS, 
  EMAILJS_CONFIG as EMAIL_CONFIG,
  sendReferralEmail, 
  processPendingEmailsForUI 
} from '../email';
export { sendInvitationEmail, generateInvitationEmailContent } from './invitationService';

// Keep other exports for backward compatibility
export { generateReferralEmailTemplate } from './templates';
export { sendEmailDirect } from './directEmail';
export { processPendingEmails } from './firestoreEmail';
