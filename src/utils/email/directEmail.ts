
import emailjs from 'emailjs-com';
import { EMAILJS_CONFIG } from './config';

/**
 * Sends an email directly to the recipient
 * Serves as a fallback mechanism when the primary EmailJS method fails
 */
export const sendEmailDirect = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string, 
  message: string,
  additionalParams: Record<string, any> = {}
) => {
  console.log("Attempting to send email via direct method to:", toEmail);
  
  // Try to use EmailJS with a different template/configuration as fallback
  try {
    // Attempt with alternative template IDs that may be available in the account
    const alternativeTemplateIds = ['template_basic', 'template_default', 'template_simple'];
    
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
    
    // Try each template ID in sequence
    for (const templateId of alternativeTemplateIds) {
      try {
        console.log(`Attempting fallback email with template: ${templateId}`);
        
        // Use the same service ID but different template
        const response = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          templateId,
          templateParams,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log(`Fallback email sent successfully with template ${templateId}:`, response);
        return true;
      } catch (templateError) {
        console.error(`Error using template ${templateId}:`, templateError);
      }
    }
    
    // If all templates fail, use a direct approach with minimal parameters
    try {
      const simpleParams = {
        to_email: toEmail,
        to_name: toName,
        from_name: fromName,
        subject: subject,
        message: `${fromName} has invited you to try MYWATER with a 20% discount! Use code: ${additionalParams.referral_code || 'MYWATER20'} at https://mywater.com/products`,
      };
      
      console.log("Attempting last resort email with minimal parameters");
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        simpleParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      console.log("Simple fallback email sent successfully:", response);
      return true;
    } catch (simpleError) {
      console.error("All EmailJS attempts failed:", simpleError);
      
      // Log the error details for debugging
      console.error("Error details:", JSON.stringify(simpleError));
      return false;
    }
  } catch (error) {
    console.error("Direct email method failed completely:", error);
    return false;
  }
};
