
/**
 * Generates a template for referral emails with improved deliverability
 */
export const generateReferralEmailTemplate = (
  toName: string,
  fromName: string,
  referralCode: string
) => {
  return `Hi ${toName || "[Friend's Name]"},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this code: ${referralCode} when you purchase.

Check it out here: https://mywater.com/products

Best,
${fromName || "[Your Name]"}`;
};

/**
 * Generates a minimal email template for maximum deliverability
 */
export const generateMinimalReferralEmailTemplate = (
  toName: string,
  fromName: string,
  referralCode: string
) => {
  return `Hi ${toName},

${fromName} invites you to try MYWATER with a 20% discount!

Use code: ${referralCode}

Visit: https://mywater.com/products

- MYWATER Team`;
};
