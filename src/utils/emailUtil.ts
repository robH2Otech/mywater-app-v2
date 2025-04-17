
// This is now just a simple re-export file for backward compatibility
// The primary functionality has been moved directly to useReferralTracking.tsx

// Export directly from EmailJS config if needed elsewhere
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_mywater',
  TEMPLATE_ID: 'template_referral',
  USER_ID: '20lKGYgYsf1DIICqM',
  PUBLIC_KEY: '20lKGYgYsf1DIICqM'
};

// Simple email template generator that can be used elsewhere
export const generateReferralEmailTemplate = (
  toName: string,
  fromName: string,
  referralCode: string
) => {
  return `Hi ${toName || "[Friend's Name]"},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this code: ${referralCode} when you purchase.

Check it out here: https://mywatertechnologies.com/shop?code=${referralCode}

Best,
${fromName || "[Your Name]"}`;
};

// This is now a stub for backward compatibility
// The actual implementation is in useReferralTracking
export const sendReferralEmail = async (
  toEmail: string,
  toName: string,
  fromName: string,
  referralCode: string,
  customMessage?: string
) => {
  console.warn("sendReferralEmail is deprecated. Use the useReferralTracking hook instead.");
  // Implementation moved to useReferralTracking
  return { success: false, message: "Method deprecated" };
};

// This is now a stub for backward compatibility
export const processPendingEmailsForUI = async () => {
  console.warn("processPendingEmailsForUI is deprecated. Use the useReferralTracking hook instead.");
  return 0;
};

// This is now a stub for backward compatibility
export const sendEmailWithEmailJS = async () => {
  console.warn("sendEmailWithEmailJS is deprecated. Use the useReferralTracking hook directly.");
  return { status: 400 };
};

// This is now a stub for backward compatibility
export const sendEmailDirect = async () => {
  console.warn("sendEmailDirect is deprecated. Use the useReferralTracking hook directly.");
  return false;
};

// This is now a stub for backward compatibility
export const processPendingEmails = async () => {
  console.warn("processPendingEmails is deprecated. Use the useReferralTracking hook directly.");
  return { total: 0, success: 0 };
};
