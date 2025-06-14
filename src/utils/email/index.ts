
// Re-export all email utility functions from a single entry point
export { sendEmailWithEmailJS, EMAILJS_CONFIG, initEmailJS } from './config';
export { generateReferralEmailTemplate } from './templates';
export { sendEmailDirect } from './directEmail';
export { processPendingEmails } from './firestoreEmail';
export { sendReferralEmail, processPendingEmailsForUI } from './referralEmail';
export { sendInvitationEmail, generateInvitationEmailTemplate } from './invitationEmail';
