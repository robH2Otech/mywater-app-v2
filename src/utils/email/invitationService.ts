
import { sendEmail } from './emailConfig';

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
 * Send invitation email to a newly created business user
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
    
    // Send the email
    const result = await sendEmail(
      userEmail,
      userName,
      subject,
      message,
      senderName
    );
    
    if (result.success) {
      console.log(`Invitation email sent successfully to ${userEmail}`);
    } else {
      console.error(`Failed to send invitation email to ${userEmail}:`, result.message);
    }
    
    return result;
    
  } catch (error) {
    console.error("Error in sendInvitationEmail:", error);
    
    return {
      success: false,
      message: `Failed to send invitation email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
