// EmailJS configuration for the referral program - Updated with correct template and keys
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_g41yi1m',
  TEMPLATE_ID: 'template_6fa0sil', // Updated to match your actual template
  USER_ID: '20lKGYgYsf1DIICqM',
  PUBLIC_KEY: 'o1aq3nZWqwn0TYfwt' // Updated to your actual public key
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

/**
 * Creates email parameters for EmailJS to send referral emails
 * @param friendEmail - Friend's email address
 * @param friendName - Friend's name
 * @param userName - User's name
 * @param referralCode - Referral code
 * @param emailMessage - Custom email message
 * @returns EmailJS template parameters
 */
export const createReferralEmailParams = (
  friendEmail: string,
  friendName: string,
  userName: string,
  referralCode: string,
  emailMessage: string
) => {
  const firstName = userName.split(' ')[0];
  const referralLink = `https://mywatertechnologies.com/shop?code=${referralCode}`;
  
  return {
    to_email: friendEmail,
    to_name: friendName,
    from_name: userName,
    message: emailMessage || `Hi ${friendName},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water and reducing plastic waste.

I'm inviting you to try MYWATER with a special 10% discount! Just use this code: ${referralCode} when you purchase.

Check it out here: ${referralLink}

Best,
${firstName}`,
    referral_code: referralCode,
    referral_link: referralLink
  };
};
