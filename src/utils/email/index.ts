
// Re-export all email utility functions from a single entry point
export { sendEmail, initEmailJS, EMAIL_CONFIG } from './emailConfig';
export { sendInvitationEmail, generateInvitationEmailContent } from './invitationService';
export { generateReferralEmailTemplate } from './templates';
export { sendEmailDirect } from './directEmail';
export { processPendingEmails } from './firestoreEmail';
export { sendReferralEmail, processPendingEmailsForUI } from './referralEmail';
