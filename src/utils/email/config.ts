import emailjs from 'emailjs-com';

// EmailJS configuration - Using hard-coded PUBLIC_KEY which works with EmailJS v3
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_mywater',
  TEMPLATE_ID: 'template_referral',
  USER_ID: '20lKGYgYsf1DIICqM',
  PUBLIC_KEY: '20lKGYgYsf1DIICqM'
};

// Keep track of initialization status
let emailJSInitialized = false;

/**
 * Helper function to ensure EmailJS is initialized
 */
export const initEmailJS = () => {
  if (!emailJSInitialized) {
    console.log("Initializing EmailJS with User ID:", EMAILJS_CONFIG.USER_ID);
    
    // Ensure we're using the proper init method for emailJS v3
    try {
      emailjs.init(EMAILJS_CONFIG.USER_ID);
      console.log("EmailJS initialized successfully");
      emailJSInitialized = true;
    } catch (err) {
      console.error("Error initializing EmailJS:", err);
      
      // Try alternative initialization method (for older versions)
      try {
        // @ts-ignore - Fallback for potential version mismatch
        if (typeof emailjs.init !== 'function' && typeof emailjs.initialize === 'function') {
          // @ts-ignore - Some versions use initialize instead of init
          emailjs.initialize(EMAILJS_CONFIG.USER_ID);
          console.log("EmailJS initialized with alternate method");
          emailJSInitialized = true;
        }
      } catch (altErr) {
        console.error("Alternative EmailJS initialization also failed:", altErr);
      }
    }
  }
  return emailJSInitialized;
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
    initEmailJS();
    
    // Clean HTML tags from message if present
    const cleanMessage = message.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');
    
    // For referral emails, create a simpler message that's more likely to work
    const isReferral = additionalParams.referral_code || subject.toLowerCase().includes('referral') || subject.toLowerCase().includes('invite');
    const messageToSend = isReferral 
      ? `${fromName} has invited you to try MYWATER with a 20% discount! Use code ${additionalParams.referral_code || 'MYWATER20'} when you purchase at https://mywater.com/products`
      : cleanMessage;
    
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      message: messageToSend,
      subject: subject,
      from_email: "noreply@mywatertechnologies.com",
      reply_to: "noreply@mywatertechnologies.com",
      ...additionalParams
    };
    
    console.log("Sending email with params:", {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID, 
      params: { ...templateParams }
    });
    
    // Use the send method with PUBLIC_KEY
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
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
