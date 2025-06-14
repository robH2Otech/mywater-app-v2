
import { sendEmailDirect } from './directEmail';
import { initEmailJS } from './config';

/**
 * Generates an invitation email template for new business users
 */
export const generateInvitationEmailTemplate = (
  userName: string,
  userEmail: string,
  companyName: string,
  senderName: string
) => {
  return `Hi ${userName},

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
};

/**
 * Sends an invitation email to a newly created business user
 */
export const sendInvitationEmail = async (
  userEmail: string,
  userName: string,
  companyName: string,
  senderName: string = "X-WATER Admin"
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Sending invitation email to ${userEmail} for ${userName}`);
    
    // Initialize EmailJS
    initEmailJS();
    
    // Generate email content
    const emailContent = generateInvitationEmailTemplate(
      userName,
      userEmail,
      companyName,
      senderName
    );
    
    const subject = `Welcome to X-WATER - You've been invited to join ${companyName}`;
    
    // Send the invitation email
    await sendEmailDirect(
      userEmail,
      userName,
      senderName,
      subject,
      emailContent
    );
    
    console.log(`Invitation email sent successfully to ${userEmail}`);
    
    return {
      success: true,
      message: `Invitation email sent successfully to ${userEmail}`
    };
    
  } catch (error) {
    console.error("Error sending invitation email:", error);
    
    return {
      success: false,
      message: `Failed to send invitation email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
