// Re-export all email utility functions from the consolidated configuration
export { sendEmail, initEmailJS, EMAIL_CONFIG } from './emailConfig';
export { sendInvitationEmail, generateInvitationEmailContent } from './invitationService';

// Keep other exports for backward compatibility
export { generateReferralEmailTemplate } from './templates';
export { sendEmailDirect } from './directEmail';
export { processPendingEmails } from './firestoreEmail';
export { sendReferralEmail, processPendingEmailsForUI } from './referralEmail';
