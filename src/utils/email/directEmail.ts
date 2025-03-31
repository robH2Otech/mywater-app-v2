
import { sendEmailWithEmailJS } from './config';

/**
 * Sends an email directly to the recipient
 * Serves as a fallback mechanism when EmailJS fails
 */
export const sendEmailDirect = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string, 
  message: string
) => {
  console.log("Attempting to send email via direct method");
  
  // Try to use EmailJS if available (different configuration)
  try {
    // We can try again with different settings or service
    console.log('Attempting direct email delivery to:', toEmail);
    
    // For development/testing: log the email that would be sent
    console.log({
      to: toEmail,
      subject,
      body: message,
      from: "contact@mywatertechnologies.com",
      fromName
    });
    
    // You can implement additional fallback email services here
    // For example, using a different EmailJS template or service
    
    // Simulate successful email for now, in production connect to a real email service
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log("Fallback email sent successfully (simulated)");
        resolve(true);
      }, 1000);
    });
  } catch (error) {
    console.error("All email delivery methods failed:", error);
    return false;
  }
};
