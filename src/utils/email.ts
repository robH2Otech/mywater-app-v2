import { addDoc, updateDoc, doc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
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

/**
 * Helper function to send emails using EmailJS (reliable approach)
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
    
    // Use minimal param set only
    const minimalParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      subject: subject,
      message: message.slice(0, 500), // Limit message size for better deliverability
      reply_to: "noreply@mywatertechnologies.com",
      ...additionalParams
    };
    
    console.log("Sending email with EmailJS using minimal params", minimalParams);

    // Use only emailjs.send, do NOT attempt sendForm fallback!
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      minimalParams as any,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email with EmailJS:", error);
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
 * Generates a minimal email template for maximum deliverability
 */
export const generateMinimalReferralEmailTemplate = (
  toName: string,
  fromName: string,
  referralCode: string
) => {
  return `Hi ${toName},

${fromName} invites you to try MYWATER with a 20% discount!

Use code: ${referralCode}

Visit: https://mywater.com/products

- MYWATER Team`;
};

/**
 * Sends an email directly to the recipient using minimal parameters
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
      simpleParams as any,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    console.log("Direct email sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Direct email method failed:", error);
    
    // Try one more method with ultra-minimal content as a last resort
    try {
      const ultraSimpleParams = {
        to_email: toEmail,
        to_name: toName,
        from_name: fromName,
        subject: `${fromName} invited you to try MYWATER with a discount!`,
        message: `${fromName} has invited you to try MYWATER with a 20% discount! Visit https://mywater.com/products and use code MYWATER20`,
        reply_to: "noreply@mywatertechnologies.com"
      };
      
      console.log("Trying ultra-simple email parameters:", ultraSimpleParams);
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        ultraSimpleParams as any,
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

/**
 * Store email in Firestore for tracking and auditing
 */
export const storeEmailInFirestore = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string,
  emailContent: string,
  referralCode: string
) => {
  try {
    const emailDocRef = await addDoc(collection(db, "emails_to_send"), {
      to: toEmail,
      to_name: toName,
      from: "noreply@mywatertechnologies.com",
      from_name: fromName,
      subject: subject,
      body: emailContent,
      html_body: emailContent.replace(/\n/g, "<br>"),
      created_at: new Date(),
      status: "pending",
      type: "referral",
      referral_code: referralCode,
      attempts: 0
    });
    
    console.log("Email stored in Firestore with ID:", emailDocRef.id);
    return emailDocRef;
  } catch (error) {
    console.error("Error storing email in Firestore:", error);
    throw error;
  }
};

/**
 * Update email status to failed in Firestore
 */
export const markEmailAsFailed = async (emailDocId: string, error: any) => {
  try {
    await updateDoc(doc(db, "emails_to_send", emailDocId), {
      status: "failed",
      attempts: 1,
      last_attempt: new Date(),
      error: error instanceof Error ? error.message : String(error)
    });
    console.log("Email marked as failed in Firestore");
  } catch (updateError) {
    console.error("Error updating email status:", updateError);
  }
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

    // Store in Firestore for tracking
    const emailDocRef = await storeEmailInFirestore(
      toEmail,
      toName,
      fromName,
      subject,
      emailContent,
      referralCode
    );

    try {
      // Direct attempt with EmailJS
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
      
      console.log("Sending email with EmailJS direct implementation", templateParams);
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID, 
        templateParams as any,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      console.log("Email sent successfully:", response);
      
      // Update status in Firestore
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "sent",
        sent_at: new Date(),
        attempts: 1,
        sent_method: "direct"
      });
      
      return { 
        success: true, 
        message: "Email sent successfully",
        emailId: emailDocRef.id 
      };
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Try simplified approach as fallback
      try {
        // Try minimal template for better deliverability
        const minimalContent = generateMinimalReferralEmailTemplate(toName, fromName, referralCode);
        
        const fallbackParams = {
          to_email: toEmail,
          to_name: toName,
          from_name: fromName,
          subject: `${fromName} invited you to try MYWATER!`,
          message: minimalContent,
          reply_to: "noreply@mywatertechnologies.com",
          referral_code: referralCode
        };
        
        console.log("Trying fallback email with minimal parameters", fallbackParams);
        
        const fallbackResponse = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          fallbackParams as any,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log("Fallback email sent successfully:", fallbackResponse);
        
        await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
          status: "sent",
          sent_at: new Date(),
          attempts: 1,
          sent_method: "fallback"
        });
        
        return {
          success: true,
          message: "Email sent using fallback method",
          emailId: emailDocRef.id
        };
      } catch (fallbackError) {
        console.error("Fallback email also failed:", fallbackError);
        
        // Update attempt counter
        await markEmailAsFailed(emailDocRef.id, fallbackError);
        
        throw new Error("Email delivery failed after multiple attempts");
      }
    }
  } catch (error) {
    console.error("Error in sendReferralEmail:", error);
    throw error;
  }
};

/**
 * Processes any pending emails in the Firestore collection
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
        
        // Try multiple methods to send the email
        try {
          await sendEmailWithEmailJS(
            emailData.to,
            emailData.to_name || emailData.to,
            emailData.from_name,
            emailData.subject,
            emailData.body,
            { 
              referral_code: emailData.referral_code,
              html_body: emailData.html_body || emailData.body
            }
          );
          
          // Mark as sent
          await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
            status: "sent",
            sent_at: new Date(),
            attempts: (emailData.attempts || 0) + 1,
            sent_method: "primary"
          });
          
          processedCount++;
          successCount++;
          console.log(`Email ${emailDoc.id} sent successfully via primary method`);
          continue;
        } catch (error) {
          console.error(`Primary method failed for email ${emailDoc.id}:`, error);
          
          // Try fallback method with minimal parameters
          try {
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
              sent_method: "fallback"
            });
            
            processedCount++;
            successCount++;
            continue;
          } catch (fallbackError) {
            // All methods failed, mark as failed with proper error message
            await markEmailAsFailed(emailDoc.id, fallbackError);
            processedCount++;
          }
        }
      } catch (processingError) {
        console.error(`Error processing email ${emailDoc.id}:`, processingError);
        await markEmailAsFailed(emailDoc.id, processingError);
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
 * Processes pending emails for UI
 */
export const processPendingEmailsForUI = async () => {
  try {
    console.log("Processing pending emails from Firestore");
    
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
        
        // Try to send with minimal parameters
        const simpleParams = {
          to_email: emailData.to,
          to_name: emailData.to_name || emailData.to.split('@')[0],
          from_name: emailData.from_name || "MYWATER",
          subject: `${emailData.from_name || "MYWATER"} invited you to try MYWATER!`,
          message: `${emailData.from_name || "Someone"} has invited you to try MYWATER with a 20% discount! Visit https://mywater.com/products and use code ${emailData.referral_code || "MYWATER20"}`,
          reply_to: "noreply@mywatertechnologies.com",
          referral_code: emailData.referral_code || "MYWATER20"
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
          sent_method: "retry_ui"
        });
        
        processedCount++;
        successCount++;
      } catch (error) {
        console.error(`Error processing email ${emailDoc.id}:`, error);
        await markEmailAsFailed(emailDoc.id, error);
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
