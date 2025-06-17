
import emailjs from 'emailjs-com';
import { EMAILJS_CONFIG, initEmailJS } from '../email';

/**
 * Generate invitation email content for new business users with login credentials
 */
export const generateInvitationEmailContent = (
  userName: string,
  userEmail: string,
  userPassword: string,
  companyName: string,
  senderName: string = "X-WATER Admin"
): { subject: string; message: string } => {
  const subject = `Welcome to X-WATER - Your Account Details for ${companyName}`;

  const message = `Hi ${userName},

Welcome to X-WATER! Your business account has been created for ${companyName}.

Your login credentials:
• Email: ${userEmail}
• Password: ${userPassword}
• Login URL: https://x-water-v2.lovable.app/

To access your account:
1. Visit: https://x-water-v2.lovable.app/
2. Click "Sign In"
3. Enter your email: ${userEmail}
4. Enter your password: ${userPassword}

For security, we recommend changing your password after your first login.

If you have any questions, please contact your administrator or our support team.

Welcome to X-WATER!

Best regards,
${senderName}
X-WATER Team`;

  return { subject, message };
};

/**
 * Send invitation email with login credentials using EmailJS
 */
export const sendInvitationEmail = async (
  userEmail: string,
  userName: string,
  userPassword: string,
  companyName: string,
  senderName: string = "X-WATER Admin"
): Promise<{ success: boolean; message: string }> => {
  try {
    // Prepare content with login credentials
    const { subject, message } = generateInvitationEmailContent(
      userName,
      userEmail,
      userPassword,
      companyName,
      senderName
    );

    console.log("[Invitation] Using EmailJS configuration:", {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID,
      publicKey: EMAILJS_CONFIG.PUBLIC_KEY
    });

    // Initialize EmailJS
    initEmailJS();

    // Template parameters for EmailJS
    const templateParams = {
      name: userName,
      email: userEmail,
      subject: subject,
      message: message
    };

    console.log("[Invitation] Sending invitation email with login credentials to:", userEmail);

    // Send the email
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log("[Invitation] Invitation email sent successfully:", response);

    return {
      success: true,
      message: `Invitation email with login credentials sent successfully to ${userEmail}`
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
    console.error("[Invitation] Failed to send invitation email:", errorDetails, error);
    return {
      success: false,
      message: "Failed to send invitation email. " + (errorDetails ? errorDetails : "Unknown error.")
    };
  }
};
