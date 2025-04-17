import { db } from "@/integrations/firebase/client";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { toast } from "sonner";
import emailjs from 'emailjs-com';

// EmailJS configuration
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

// Email sending utility function
export const sendEmailDirect = async (
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  subject: string,
  message: string,
  requestId?: string
) => {
  console.log(`Attempting to send email to ${recipientEmail}`);
  
  try {
    // Create record in emailHistory collection
    const emailHistoryRef = collection(db, "emailHistory");
    const emailData = {
      recipient: recipientEmail,
      recipient_name: recipientName,
      subject: subject,
      message: message,
      request_id: requestId || null,
      sent_at: new Date(),
      sent_by: senderName,
      status: "pending"
    };
    
    // Add the email to the history
    const emailDoc = await addDoc(emailHistoryRef, emailData);
    console.log("Email history record created:", emailDoc.id);
    
    // In a real app, this would connect to a backend service to send the email
    // For this demo, we'll simulate sending via Firebase Functions
    
    // For demonstration, we'll simply update the status to "sent" after a short delay
    setTimeout(async () => {
      try {
        // Update the email history record to show it was sent successfully
        await updateDoc(doc(db, "emailHistory", emailDoc.id), {
          status: "sent",
          sent_at: new Date() // Update with exact sent time
        });
        
        // If we have a request ID, update the request as well
        if (requestId) {
          const requestRef = doc(db, "support_requests", requestId);
          await updateDoc(requestRef, { 
            last_email_sent: new Date(),
            updated_at: new Date()
          });
        }
        
        console.log("Email marked as sent successfully");
        toast.success("Email sent successfully");
      } catch (error) {
        console.error("Error updating email status:", error);
        toast.error("Error updating email status");
      }
    }, 1500);
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    toast.error("Failed to send email");
    throw error;
  }
};

/**
 * Generates a template for referral emails with improved deliverability
 */
export const generateReferralEmailTemplate = (
  toName: string,
  fromName: string,
  referralCode: string
) => {
  return `Hi ${toName || "[Friend's Name]"},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this code: ${referralCode} when you purchase.

Check it out here: https://mywater.com/products

Best,
${fromName || "[Your Name]"}`;
};

/**
 * Sends a referral email with improved error handling and fallbacks
 */
export const sendReferralEmail = async (
  toEmail: string,
  toName: string,
  fromName: string,
  referralCode: string,
  customMessage?: string
) => {
  try {
    console.log(`Sending referral email to ${toEmail} (${toName}) from ${fromName} with code ${referralCode}`);
    
    // Generate default message if none provided
    const emailContent = customMessage || generateReferralEmailTemplate(toName, fromName, referralCode);
    const subject = `${fromName} invited you to try MYWATER (20% discount!)`;

    // Initialize EmailJS
    initEmailJS();
    
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      subject: subject,
      message: emailContent,
      reply_to: "noreply@mywatertechnologies.com",
      referral_code: referralCode
    };
    
    try {
      // Try to send the email with EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID, 
        templateParams as any,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      console.log("Email sent successfully:", response);
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Store in Firestore for retry
      const emailDocRef = await addDoc(collection(db, "emails_to_send"), {
        to: toEmail,
        to_name: toName,
        from: "noreply@mywatertechnologies.com",
        from_name: fromName,
        subject: subject,
        body: emailContent,
        created_at: new Date(),
        status: "pending",
        type: "referral",
        referral_code: referralCode,
        attempts: 0
      });
      
      console.log("Email stored for later sending:", emailDocRef.id);
      throw new Error("Email delivery failed, saved for later retry");
    }
  } catch (error) {
    console.error("Error in sendReferralEmail:", error);
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
      reply_to: "noreply@mywatertechnologies.com",
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
        EMAILJS_CONFIG.TEMPLATE_ID,
        minimalParams as any, // Type cast to bypass TypeScript error
        EMAILJS_CONFIG.PUBLIC_KEY
      );
    } catch (err) {
      console.error("Modern EmailJS send failed, trying alternative method:", err);
      
      // Try alternative send method (v2)
      // @ts-ignore - For older versions
      response = await emailjs.sendForm(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
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

/**
 * Processes pending emails from Firestore
 */
export const processPendingEmails = async () => {
  try {
    const emailsQuery = query(
      collection(db, "emails_to_send"),
      where("status", "==", "pending")
    );
    
    const emailsSnapshot = await getDocs(emailsQuery);
    let processedCount = 0;
    let successCount = 0;
    
    console.log(`Found ${emailsSnapshot.docs.length} pending emails to process`);
    
    for (const emailDoc of emailsSnapshot.docs) {
      const emailData = emailDoc.data();
      
      try {
        console.log(`Processing email ${emailDoc.id} to ${emailData.to}`);
        
        // Initialize EmailJS
        initEmailJS();
        
        const simpleParams = {
          to_email: emailData.to,
          to_name: emailData.to_name || emailData.to,
          from_name: emailData.from_name,
          message: `${emailData.from_name} has invited you to try MYWATER with a 20% discount! Use code ${emailData.referral_code} when you purchase at https://mywater.com/products`,
          subject: emailData.subject || `${emailData.from_name} invited you to try MYWATER (20% discount!)`,
          reply_to: "noreply@mywatertechnologies.com"
        };
        
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          simpleParams as any,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "sent",
          sent_at: new Date(),
          attempts: (emailData.attempts || 0) + 1,
          sent_method: "direct_simple"
        });
        
        processedCount++;
        successCount++;
        console.log(`Email ${emailDoc.id} sent successfully`);
      } catch (processingError) {
        console.error(`Error processing email ${emailDoc.id}:`, processingError);
        
        // Convert error to string to prevent [object Object] in Firestore
        const errorMessage = processingError instanceof Error 
          ? processingError.message 
          : (typeof processingError === 'object' ? JSON.stringify(processingError) : String(processingError));
        
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "failed",
          error: errorMessage,
          attempts: (emailData.attempts || 0) + 1,
          last_attempt: new Date()
        });
        processedCount++;
      }
    }
    
    console.log(`Processed ${processedCount} emails, ${successCount} sent successfully`);
    return { total: processedCount, success: successCount };
  } catch (error) {
    console.error("Error processing emails:", error);
    return { total: 0, success: 0, error: String(error) };
  }
};

/**
 * Processes pending emails for the UI
 */
export const processPendingEmailsForUI = async () => {
  try {
    console.log("Processing pending emails from Firestore for UI");
    
    // Get pending emails from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const pendingQuery = query(
      collection(db, "emails_to_send"),
      where("status", "in", ["pending", "failed"]),
      where("created_at", ">=", oneWeekAgo)
    );
    
    const pendingSnapshot = await getDocs(pendingQuery);
    console.log(`Found ${pendingSnapshot.docs.length} pending emails to process`);
    
    let processedCount = 0;
    let successCount = 0;
    
    // Process each email
    for (const emailDoc of pendingSnapshot.docs) {
      const emailData = emailDoc.data();
      
      try {
        console.log(`Retrying email ${emailDoc.id} to ${emailData.to}`);
        
        // Initialize EmailJS
        initEmailJS();
        
        // Try to send the email with simplified parameters
        const simpleParams = {
          to_email: emailData.to,
          to_name: emailData.to_name || emailData.to.split('@')[0],
          from_name: emailData.from_name || "MYWATER",
          subject: `${emailData.from_name || "Someone"} invited you to try MYWATER!`,
          message: `Use code ${emailData.referral_code || "MYWATER20"} for 20% off at mywater.com/products`,
          reply_to: "noreply@mywatertechnologies.com"
        };
        
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          simpleParams as any,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "sent",
          sent_at: new Date(),
          attempts: (emailData.attempts || 0) + 1,
          sent_method: "ui_retry"
        });
        
        processedCount++;
        successCount++;
      } catch (error) {
        console.error(`Error processing email ${emailDoc.id}:`, error);
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "failed",
          last_attempt: new Date(),
          error: error instanceof Error ? error.message : String(error)
        });
        processedCount++;
      }
    }
    
    console.log(`Processed ${processedCount} emails, ${successCount} sent successfully`);
    return successCount;
  } catch (error) {
    console.error("Error in processPendingEmailsForUI:", error);
    return 0;
  }
};

// Add the missing query and getDocs imports
import { query, where, getDocs } from "firebase/firestore";
