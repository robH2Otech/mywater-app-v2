
import { sendEmailWithEmailJS, EMAILJS_CONFIG, initEmailJS } from '../email';

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
 * Send invitation email using the proven working email configuration and template.
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

    // Try sending with the most reliable code path.
    await sendEmailWithEmailJS(
      userEmail,
      userName,
      senderName,
      subject,
      message,
      {
        referral_code: "BUSINESS_INVITE", // Template param, always filled for compatibility
        html_body: message.replace(/\n/g, "<br>")
      }
    );

    return {
      success: true,
      message: `Invitation email sent successfully to ${userEmail}.`
    };
  } catch (error: any) {
    console.error("Critical: Invitation email failed:", error);
    // Return detailed error to user for fast troubleshooting.
    return {
      success: false,
      message:
        "Failed to send invitation email. " +
        (error && error.message ? error.message : String(error))
    };
  }
};
