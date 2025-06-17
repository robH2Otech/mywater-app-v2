import emailjs from 'emailjs-com';

// EmailJS configuration - Updated with correct template and keys
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_g41yi1m',
  TEMPLATE_ID: 'template_5blm1qm', // Updated to match your actual template ID
  USER_ID: '20lKGYgYsf1DIICqM',
  PUBLIC_KEY: 'o1aq3nZWqwn0TYfwt' // Updated to your actual public key
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
      
      // Test if emailjs is properly initialized
      if (typeof emailjs.send !== 'function') {
        throw new Error("EmailJS send function not available after initialization");
      }
      
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
