
// Re-export from the modular email components
export { 
  sendEmailWithEmailJS as sendEmail, 
  initEmailJS, 
  sendEmailDirect
} from './emailService';

export { 
  EMAILJS_CONFIG as EMAIL_CONFIG,
  EMAILJS_CONFIG
} from './config';

export { 
  sendReferralEmail, 
  processPendingEmailsForUI 
} from './referralOperations';

export { sendInvitationEmail, generateInvitationEmailContent } from './invitationService';

// Keep other exports for backward compatibility
export { generateReferralEmailTemplate } from './templates';
export { processPendingEmails } from './firestoreEmail';

// Legacy compatibility exports (cleaned up) - re-export the function properly
export { sendEmailWithEmailJS } from './emailService';
