
import { sendEmailWithEmailJS } from './config';

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
    // Attempt with alternative EmailJS configuration
    // This could be a different template or service ID dedicated to fallback scenarios
    const alternativeServiceId = 'service_mywater_fallback';
    const alternativeTemplateId = 'template_basic';
    
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
    
    console.log("Attempting fallback email delivery with params:", {
      alternativeServiceId,
      alternativeTemplateId,
      toEmail,
      subject
    });
    
    // For development/testing: log the email that would be sent
    console.log({
      to: toEmail,
      subject,
      body: cleanMessage,
      from: "contact@mywatertechnologies.com",
      fromName
    });
    
    // Try with primary configuration one more time, with simplified parameters
    try {
      const response = await emailjs.send(
        'service_mywater',  // Use primary service ID
        'template_referral', // Use primary template ID
        {
          to_email: toEmail,
          to_name: toName,
          from_name: fromName,
          subject: subject,
          message: `${fromName} has invited you to try MYWATER with a 20% discount! Use code: ${additionalParams.referral_code || 'MYWATER20'} at https://mywater.com/products`,
        }
      );
      console.log("Fallback email sent successfully with primary service:", response);
      return true;
    } catch (primaryError) {
      console.error("Primary service fallback failed:", primaryError);
      
      // Simulate successful email for now
      // In production, implement a real alternative email service here
      console.log("Would attempt alternative email service here in production");
      return false;
    }
  } catch (error) {
    console.error("All email delivery methods failed:", error);
    return false;
  }
};
