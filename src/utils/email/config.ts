import emailjs from 'emailjs-com';

// EmailJS configuration - Fixed to ensure proper initialization for both v2 and v3
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_mywater',
  TEMPLATE_ID: 'template_referral',
  USER_ID: '20lKGYgYsf1DIICqM',  // This should be the actual user ID - using public key as backup
  PUBLIC_KEY: '20lKGYgYsf1DIICqM'  // This should be the actual public key
};

// Keep track of initialization status
let emailJSInitialized = false;

/**
 * Helper function to ensure EmailJS is initialized
 */
export const initEmailJS = () => {
  if (!emailJSInitialized) {
    console.log("Initializing EmailJS...");
    
    try {
      // Modern EmailJS SDK initialization (v3)
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      console.log("EmailJS initialized successfully with PUBLIC_KEY");
      emailJSInitialized = true;
    } catch (err) {
      console.error("Error initializing EmailJS:", err);
      
      // Try another method (fallback for older versions or configurations)
      try {
        // @ts-ignore - For older versions of emailjs-com
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
    // Initialize EmailJS
    initEmailJS();
    
    // For maximum deliverability with EmailJS, use a minimal params set
    const minimalParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      subject: subject,
      message: message.slice(0, 500), // Limit message size for better deliverability
      reply_to: "noreply@mywatertechnologies.com",
      ...additionalParams
    };
    
    console.log("Sending email with EmailJS using minimal params");
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      minimalParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email with EmailJS:", error);
    throw error;
  }
};
