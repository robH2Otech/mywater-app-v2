import emailjs from 'emailjs-com';

// Consolidated EmailJS configuration for X-WATER
export const EMAIL_CONFIG = {
  SERVICE_ID: 'service_mywater', // Use the working service ID
  TEMPLATE_ID: 'template_referral', // Use the existing working template for all emails
  PUBLIC_KEY: '20lKGYgYsf1DIICqM'
};

// Keep track of initialization status
let emailJSInitialized = false;

/**
 * Initialize EmailJS with proper configuration
 */
export const initEmailJS = () => {
  if (!emailJSInitialized) {
    console.log("Initializing EmailJS with consolidated config...");
    
    try {
      emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
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
 * Send email using the consolidated configuration
 */
export const sendEmail = async (
  toEmail: string,
  toName: string,
  subject: string,
  message: string,
  fromName: string = "X-WATER Team"
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Sending email to ${toEmail} with subject: ${subject}`);
    
    // Initialize EmailJS
    initEmailJS();
    
    // Create email parameters
    const emailParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      subject: subject,
      message: message,
      reply_to: "noreply@x-watertechnologies.com"
    };
    
    console.log("Email parameters:", emailParams);
    
    // Send email
    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      emailParams,
      EMAIL_CONFIG.PUBLIC_KEY
    );
    
    console.log("Email sent successfully:", response);
    
    return {
      success: true,
      message: `Email sent successfully to ${toEmail}`
    };
    
  } catch (error) {
    console.error("Error sending email:", error);
    
    return {
      success: false,
      message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
