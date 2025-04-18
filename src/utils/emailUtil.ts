
// EmailJS configuration for the referral program
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_mywater',
  TEMPLATE_ID: 'template_referral',
  USER_ID: '20lKGYgYsf1DIICqM',
  PUBLIC_KEY: '20lKGYgYsf1DIICqM'
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
  
  const shareText = `Hi [Friend's Name],

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water and reducing plastic waste.

I'm inviting you to try MYWATER with a special 10% discount! Just use this code: ${referralCode} when you purchase.

Check it out here: ${referralLink}

Best,
${firstName}`;
  
  return {
    title: 'MYWATER - Get 10% Off!',
    text: shareText,
    url: referralLink
  };
};
