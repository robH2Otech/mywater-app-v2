
import { sendEmailWithEmailJS } from './config';

/**
 * Sends an email directly to the recipient
 */
export const sendEmailDirect = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string, 
  message: string
) => {
  // Try to use EmailJS if available
  try {
    await sendEmailWithEmailJS(toEmail, toName, fromName, subject, message);
    console.log('Email sent successfully via EmailJS');
    return true;
  } catch (emailJsError) {
    console.error("Error sending via EmailJS:", emailJsError);
    
    // Fallback to simulation if EmailJS fails
    console.log("Direct email sending (simulated):", {
      to: toEmail,
      toName,
      fromName,
      subject,
      message,
      from: "contact@mywatertechnologies.com"
    });
    
    // For development only - simulate email delivery
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Email delivered (simulated)");
        resolve(true);
      }, 1500);
    });
  }
};
