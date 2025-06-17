
import emailjs from 'emailjs-com';
import { EMAILJS_CONFIG, initEmailJS } from './config';

/**
 * Helper function to send emails using EmailJS (reliable approach)
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
    // Initialize EmailJS
    initEmailJS();
    
    // Use minimal param set only
    const minimalParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      subject: subject,
      message: message.slice(0, 500), // Limit message size for better deliverability
      reply_to: "noreply@mywatertechnologies.com",
      ...additionalParams
    };
    
    console.log("Sending email with EmailJS using minimal params", minimalParams);

    // Use only emailjs.send, do NOT attempt sendForm fallback!
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      minimalParams as any,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email with EmailJS:", error);
    throw error;
  }
};

/**
 * Sends an email directly to the recipient using minimal parameters
 */
export const sendEmailDirect = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string, 
  message: string
): Promise<boolean> => {
  console.log("Attempting to send email via direct method to:", toEmail);
  
  try {
    // Initialize EmailJS
    initEmailJS();
    
    // Create a simple version of the template params
    const simpleParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      subject: subject,
      message: message.replace(/<br>/g, '\n').replace(/<[^>]*>/g, ''),
      reply_to: "noreply@mywatertechnologies.com"
    };
    
    console.log("Sending direct email with parameters:", simpleParams);
    
    // Try with default service/template
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      simpleParams as any,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    console.log("Direct email sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Direct email method failed:", error);
    
    // Try one more method with ultra-minimal content as a last resort
    try {
      const ultraSimpleParams = {
        to_email: toEmail,
        to_name: toName,
        from_name: fromName,
        subject: `${fromName} invited you to try MYWATER with a discount!`,
        message: `${fromName} has invited you to try MYWATER with a 20% discount! Visit https://mywater.com/products and use code MYWATER20`,
        reply_to: "noreply@mywatertechnologies.com"
      };
      
      console.log("Trying ultra-simple email parameters:", ultraSimpleParams);
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        ultraSimpleParams as any,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      console.log("Ultra-simple email sent successfully:", response);
      return true;
    } catch (finalError) {
      console.error("All email delivery attempts failed:", finalError);
      throw finalError;
    }
  }
};
