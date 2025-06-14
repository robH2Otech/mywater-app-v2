import emailjs from 'emailjs-com';

// EmailJS configuration - Simplified for X-WATER
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_mywater', // Use the working service ID
  TEMPLATE_ID_REFERRAL: 'template_referral',
  TEMPLATE_ID_INVITATION: 'template_invitation', // New template for invitations
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
    console.log("Initializing EmailJS...");
    
    try {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      console.log("EmailJS initialized successfully");
      emailJSInitialized = true;
      
      if (typeof emailjs.send !== 'function') {
        throw new Error("EmailJS send function not available after initialization");
      }
      
    } catch (err) {
      console.error("Error initializing EmailJS:", err);
    }
  }
  return emailJSInitialized;
};

/**
 * Send email with simplified parameters for invitations
 */
export const sendInvitationEmailDirect = async (
  toEmail: string,
  toName: string,
  companyName: string,
  senderName: string
) => {
  try {
    initEmailJS();
    
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      company_name: companyName,
      sender_name: senderName,
      login_url: "https://x-water.com/auth",
      reply_to: "noreply@x-watertechnologies.com"
    };
    
    console.log("Sending invitation email with params:", templateParams);
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_INVITATION,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    console.log("Invitation email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw error;
  }
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
      reply_to: "noreply@x-watertechnologies.com", // Updated for X-WATER
      ...additionalParams
    };
    
    console.log("Sending email with EmailJS using minimal params");
    
    // Make sure we're calling send correctly based on the library version
    let response;
    
    try {
      // First try the modern approach (v3)
      // Fix: Cast the parameters object to any to work around the type constraints
      // This works because the actual emailjs library accepts these parameters
      response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID_REFERRAL,
        minimalParams as any, // Type cast to bypass TypeScript error
        EMAILJS_CONFIG.PUBLIC_KEY
      );
    } catch (err) {
      console.error("Modern EmailJS send failed, trying alternative method:", err);
      
      // Try alternative send method (v2)
      // @ts-ignore - For older versions
      response = await emailjs.sendForm(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID_REFERRAL,
        minimalParams as any, // Type cast here as well
        EMAILJS_CONFIG.USER_ID
      );
    }
    
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email with EmailJS:", error);
    throw error;
  }
};
