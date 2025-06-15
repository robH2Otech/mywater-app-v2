
import { sendReferralEmail } from '../email/referralEmail';

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
 * Send invitation email using the same reliable logic as referral emails
 */
export const sendInvitationEmail = async (
  userEmail: string,
  userName: string,
  companyName: string,
  senderName: string = "X-WATER Admin"
): Promise<{ success: boolean; message: string }> => {
  try {
    const { subject, message } = generateInvitationEmailContent(
      userName,
      userEmail,
      companyName,
      senderName
    );

    // Use invite code 'WELCOME' for clarity!
    const referralResult = await sendReferralEmail(
      userEmail,
      userName,
      senderName,
      "WELCOME", // fake/placeholder code for invites
      message
    );

    if (referralResult && referralResult.success) {
      return {
        success: true,
        message: "Invitation sent successfully."
      };
    } else {
      const errorMsg = referralResult && referralResult.message ? referralResult.message : "Unknown failure in sending invite.";
      return {
        success: false,
        message: `Failed to send invitation: ${errorMsg}`
      };
    }
  } catch (error: any) {
    console.error("sendInvitationEmail error:", error);
    return {
      success: false,
      message: `Failed to send invitation: ${error?.message ?? String(error)}`
    };
  }
};
