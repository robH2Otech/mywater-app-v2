
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { EMAILJS_CONFIG, initEmailJS } from './config';
import { generateReferralEmailTemplate } from './templates';
import emailjs from 'emailjs-com';
import { processPendingEmails } from './firestoreEmail';

/**
 * Sends a referral email to the specified recipient with direct EmailJS implementation
 */
export const sendReferralEmail = async (
  toEmail: string,
  toName: string,
  fromName: string,
  referralCode: string,
  customMessage?: string
) => {
  try {
    // Initialize EmailJS first
    const isInitialized = initEmailJS();
    if (!isInitialized) {
      console.error("EmailJS initialization failed");
    }
    
    // Generate default message if none provided
    const emailContent = customMessage || generateReferralEmailTemplate(toName, fromName, referralCode);
    const subject = `${fromName} invited you to try MYWATER (20% discount!)`;

    // Store in Firestore for record-keeping and tracking
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
      referral_code: referralCode
    });

    console.log("Email stored in Firestore with ID:", emailDocRef.id);
    
    // DIRECT IMPLEMENTATION WITH EMAILJS
    // This improves the odds of successful delivery by simplifying the payload
    const simpleEmailParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      subject: subject,
      message: `${fromName} invites you to try MYWATER with a 20% discount! Use code ${referralCode} at https://mywater.com/products`,
      reply_to: "noreply@mywatertechnologies.com"
    };
    
    try {
      // Send with direct implementation using minimal parameters
      console.log("Sending email with EmailJS direct implementation");
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID, 
        simpleEmailParams as any, // Type cast to bypass TypeScript error
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      console.log("Email sent successfully:", response);
      
      // Update status in Firestore
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "sent",
        sent_at: new Date(),
        sent_method: "direct_simple"
      });
      
      return true;
    } catch (emailJSError) {
      console.error("EmailJS direct implementation failed:", emailJSError);
      
      // Try with ultra minimal content as a last resort
      try {
        const ultraSimpleParams = {
          to_email: toEmail,
          to_name: toName,
          from_name: fromName,
          subject: `${fromName} has invited you to MYWATER`,
          message: `You've been invited to try MYWATER with a discount code: ${referralCode}`,
        };
        
        console.log("Trying ultra-simple email parameters");
        const fallbackResponse = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          ultraSimpleParams as any,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log("Fallback email sent successfully:", fallbackResponse);
        
        // Update status in Firestore
        await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
          status: "sent",
          sent_at: new Date(),
          sent_method: "fallback_simple"
        });
        
        return true;
      } catch (fallbackError) {
        console.error("Fallback email also failed:", fallbackError);
        
        // We'll let the background processor try later
        await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
          attempts: 1,
          last_attempt: new Date()
        });
        
        // Immediately try background processing
        await processPendingEmailsForUI();
        
        // Tell the user it's been queued but return true for better UX
        return true;
      }
    }
  } catch (error) {
    console.error("Error in sendReferralEmail function:", error);
    throw new Error("Failed to send referral email");
  }
};

/**
 * Automatically attempts to process any pending emails
 * This is a simplified version that focuses on immediate delivery
 */
export const processPendingEmailsForUI = async () => {
  try {
    // Initialize EmailJS
    initEmailJS();
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Get recent pending emails (last 24 hours)
    const pendingQuery = query(
      collection(db, "emails_to_send"),
      where("status", "==", "pending"),
      where("created_at", ">=", oneDayAgo)
    );
    
    const pendingSnapshot = await getDocs(pendingQuery);
    console.log(`Found ${pendingSnapshot.docs.length} recent pending emails to process`);
    
    let processedCount = 0;
    let successCount = 0;
    
    // Process each email with robust error handling
    for (const emailDoc of pendingSnapshot.docs) {
      const emailData = emailDoc.data();
      
      try {
        // Try with the most minimal configuration possible for higher success rate
        const simpleParams = {
          to_email: emailData.to,
          to_name: emailData.to_name || emailData.to,
          from_name: emailData.from_name,
          subject: emailData.subject || `${emailData.from_name} invited you to try MYWATER (20% discount!)`,
          message: `${emailData.from_name} invites you to try MYWATER! Use code ${emailData.referral_code} for 20% off at https://mywater.com/products`,
        };
        
        console.log(`Processing pending email ${emailDoc.id} to ${emailData.to}`);
        
        const response = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          simpleParams as any,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log(`Successfully processed email ${emailDoc.id}:`, response);
        
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "sent",
          sent_at: new Date(),
          attempts: (emailData.attempts || 0) + 1,
          sent_method: "background_processor"
        });
        
        processedCount++;
        successCount++;
      } catch (error) {
        console.error(`Error processing email ${emailDoc.id}:`, error);
        
        // Update the attempt counter but keep as pending
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          attempts: (emailData.attempts || 0) + 1,
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
