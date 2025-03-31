
import emailjs from 'emailjs-com';
import { EMAILJS_CONFIG, initEmailJS } from './config';

/**
 * Sends an email directly to the recipient
 * Uses the most basic approach possible
 */
export const sendEmailDirect = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string, 
  message: string
) => {
  console.log("Attempting to send email via simplified direct method to:", toEmail);
  
  try {
    // Initialize EmailJS
    initEmailJS();
    
    // Create the simplest possible template params
    const simpleParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      subject: subject,
      message: message.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')
    };
    
    console.log("Sending direct email with minimal parameters:", simpleParams);
    
    // Try sending with different service/template combinations
    try {
      // Try the main service/template
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        simpleParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      console.log("Direct email sent successfully:", response);
      return true;
    } catch (mainError) {
      console.error("Main email attempt failed:", mainError);
      
      // Try with default template
      try {
        const response = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          "template_default",  // Try a different template
          simpleParams,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log("Direct email sent successfully with default template:", response);
        return true;
      } catch (defaultTemplateError) {
        console.error("Default template email attempt failed:", defaultTemplateError);
        
        // One final attempt with ultra-simplified params
        try {
          const ultraSimpleParams = {
            to_email: toEmail,
            to_name: toName,
            from_name: fromName,
            subject: subject,
            message: `${fromName} has invited you to try MYWATER with a 20% discount! Visit https://mywater.com/products`
          };
          
          const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            ultraSimpleParams,
            EMAILJS_CONFIG.PUBLIC_KEY
          );
          
          console.log("Ultra-simple email sent successfully:", response);
          return true;
        } catch (ultraSimpleError) {
          console.error("All email delivery methods failed:", ultraSimpleError);
          throw ultraSimpleError;
        }
      }
    }
  } catch (error) {
    console.error("Direct email method failed completely:", error);
    throw error;
  }
};
