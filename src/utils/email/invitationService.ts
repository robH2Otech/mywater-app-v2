
import emailjs from 'emailjs-com';
import { EMAILJS_CONFIG, initEmailJS } from '../email';

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
    // Prepare content
    const { subject, message } = generateInvitationEmailContent(
      userName,
      userEmail,
      companyName,
      senderName
    );

    // Log parameters for debugging
    console.log("[Invitation] Preparing to send invite email with params:", {
      to_email: userEmail,
      to_name: userName,
      from_name: senderName,
      subject,
      message,
      reply_to: "noreply@mywatertechnologies.com",
      html_body: message.replace(/\n/g, "<br>"),
      referral_code: "BUSINESS_INVITE"
    });

    // Initialize EmailJS
    initEmailJS();

    // Compose minimal parameters tested for deliverability
    const inviteParams = {
      to_email: userEmail,
      to_name: userName,
      from_name: senderName,
      subject,
      message, // plaintext for template body
      reply_to: "noreply@mywatertechnologies.com",
      html_body: message.replace(/\n/g, "<br>"),
      referral_code: "BUSINESS_INVITE"
    };

    // Use modern emailjs.send only!
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      inviteParams as any,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log("[Invitation] Invitation email sent successfully. EmailJS response:", response);

    return {
      success: true,
      message: `Invitation email sent successfully to ${userEmail}.`
    };
  } catch (error: any) {
    let errorDetails = "";
    if (error?.message) {
      errorDetails = error.message;
    } else if (typeof error === "string") {
      errorDetails = error;
    } else {
      try {
        errorDetails = JSON.stringify(error);
      } catch {
        errorDetails = String(error);
      }
    }
    console.error("[Invitation] Critical: Invitation email failed:", errorDetails, error);
    return {
      success: false,
      message:
        "Failed to send invitation email. " +
        (errorDetails ? errorDetails : "Unknown error.")
    };
  }
};
