
import emailjs from 'emailjs-com';

// EmailJS configuration
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_mywater',
  TEMPLATE_ID: 'template_referral',
  USER_ID: '20lKGYgYsf1DIICqM'
};

/**
 * Helper function to send emails using EmailJS
 */
export const sendEmailWithEmailJS = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string,
  message: string,
  additionalParams: Record<string, any> = {}
) => {
  try {
    // Initialize EmailJS with user ID
    emailjs.init(EMAILJS_CONFIG.USER_ID);
    
    // Clean HTML tags from message if present
    const cleanMessage = message.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');
    
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      message: cleanMessage,
      subject: subject,
      from_email: "contact@mywatertechnologies.com",
      ...additionalParams
    };
    
    console.log("Sending email with params:", {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID, 
      params: { ...templateParams }
    });
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );
    
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email with EmailJS:", error);
    
    // Convert any error object to a proper string
    const errorMessage = error instanceof Error 
      ? error.message 
      : (typeof error === 'object' ? JSON.stringify(error) : String(error));
    
    console.error("Formatted error message:", errorMessage);
    throw new Error(errorMessage);
  }
};
