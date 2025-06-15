
import { sendEmailWithEmailJS, generateReferralEmailTemplate } from '../email';

/**
 * Generate invitation email content for new business users
 */
export const generateInvitationEmailContent = (
  userName: string,
  userEmail: string,
  companyName: string,
  senderName: string = "X-WATER Admin"
): { subject: string; message: string } => {
  const subject = `Welcome to X-WATER - You've been invited to join ${companyName}`;
  
  const message = `Hi ${userName},

You've been invited to join ${companyName} on the X-WATER business platform!

Your account has been created with the following details:
- Email: ${userEmail}
- Company: ${companyName}

To get started:
1. Visit the X-WATER business portal: https://x-water.com/auth
2. Sign in using your email address: ${userEmail}
3. Create your password when prompted

If you have any questions, please contact your administrator or our support team.

Welcome to X-WATER!

Best regards,
${senderName}
X-WATER Team`;

  return { subject, message };
};

/**
 * Send invitation email using the working email configuration
 */
export const sendInvitationEmail = async (
  userEmail: string,
  userName: string,
  companyName: string,
  senderName: string = "X-WATER Admin"
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Sending invitation email to ${userEmail} for ${userName} at ${companyName}`);
    
    // Generate email content
    const { subject, message } = generateInvitationEmailContent(
      userName,
      userEmail,
      companyName,
      senderName
    );
    
    // Use the proven working email function with the same parameters as referral emails
    await sendEmailWithEmailJS(
      userEmail,
      userName,
      senderName,
      subject,
      message,
      {
        referral_code: "WELCOME", // Add a referral code for template compatibility
        html_body: message.replace(/\n/g, "<br>")
      }
    );
    
    console.log(`Invitation email sent successfully to ${userEmail}`);
    
    return {
      success: true,
      message: `Invitation email sent successfully to ${userEmail}`
    };
    
  } catch (error) {
    console.error("Error in sendInvitationEmail:", error);
    
    return {
      success: false,
      message: `Failed to send invitation email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
