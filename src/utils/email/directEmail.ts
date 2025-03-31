
import emailjs from 'emailjs-com';
import { EMAILJS_CONFIG, initEmailJS } from './config';

/**
 * Sends an email directly to the recipient using minimal parameters
 * This is a fallback method when other methods fail
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
      simpleParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    console.log("Direct email sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Direct email method failed:", error);
    
    // Try with ultra-minimal parameters as a last resort
    try {
      const ultraSimpleParams = {
        to_email: toEmail,
        to_name: toName,
        from_name: fromName,
        subject: `${fromName} invited you to try MYWATER with a discount!`,
        message: `${fromName} has invited you to try MYWATER with a 20% discount! Use code MYWATER20 when you purchase. Visit https://mywater.com/products`,
        reply_to: "noreply@mywatertechnologies.com"
      };
      
      console.log("Trying ultra-simple email parameters:", ultraSimpleParams);
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        ultraSimpleParams,
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
