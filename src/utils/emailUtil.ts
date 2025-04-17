
// This is a utility file for email-related functions and constants

// EmailJS configuration for the referral program
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_mywater',
  TEMPLATE_ID: 'template_referral',
  USER_ID: '20lKGYgYsf1DIICqM',
  PUBLIC_KEY: '20lKGYgYsf1DIICqM'
};

/**
 * Generates a standard referral email template
 * @param toName - Recipient's name
 * @param fromName - Sender's name
 * @param referralCode - Unique referral code for discount
 * @returns Formatted email template string
 */
export const generateReferralEmailTemplate = (
  toName: string,
  fromName: string,
  referralCode: string
) => {
  const firstName = fromName.split(' ')[0]; // Extract first name
  
  return `Hi ${toName || "[Friend's Name]"},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this code: ${referralCode} when you purchase.

Check it out here: https://mywatertechnologies.com/shop?code=${referralCode}

Best,
${firstName || "[Your Name]"}`;
};

/**
 * Creates parameters for EmailJS template
 * @param toEmail - Recipient's email
 * @param toName - Recipient's name
 * @param fromName - Sender's name
 * @param referralCode - Referral code for discount
 * @param customMessage - Optional custom message
 * @returns Object with template parameters 
 */
export const createReferralEmailParams = (
  toEmail: string,
  toName: string,
  fromName: string,
  referralCode: string,
  customMessage?: string
) => {
  const firstName = fromName.split(' ')[0];
  
  return {
    to_email: toEmail,
    to_name: toName,
    from_name: fromName,
    subject: `${firstName} invited you to try MYWATER (20% discount!)`,
    message: customMessage || generateReferralEmailTemplate(toName, fromName, referralCode),
    reply_to: "noreply@mywatertechnologies.com",
    referral_code: referralCode,
    link_url: `https://mywatertechnologies.com/shop?code=${referralCode}`
  };
};

/**
 * Creates sharing content for various platforms
 * @param userName - User's name 
 * @param referralCode - Referral code
 * @returns Object with sharing content
 */
export const createReferralShareContent = (
  userName: string,
  referralCode: string
) => {
  const firstName = userName.split(' ')[0];
  const referralLink = `https://mywatertechnologies.com/shop?code=${referralCode}`;
  const shareText = `I'm loving my MYWATER water purification system! Get 20% off your purchase using my referral code: ${referralCode}`;
  
  return {
    title: 'MYWATER - Get 20% Off!',
    text: shareText,
    url: referralLink
  };
};
