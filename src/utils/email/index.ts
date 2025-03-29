
// Re-export all email utility functions from a single entry point
export { sendEmailWithEmailJS, EMAILJS_CONFIG } from './config';
export { generateReferralEmailTemplate } from './templates';
export { sendEmailDirect } from './directEmail';
export { processPendingEmails } from './firestoreEmail';
export { sendReferralEmail } from './referralEmail';
