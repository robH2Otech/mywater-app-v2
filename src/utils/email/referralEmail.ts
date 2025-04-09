
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { sendEmailWithEmailJS } from './config';
import { generateReferralEmailTemplate } from './templates';
import emailjs from 'emailjs-com';
import { EMAILJS_CONFIG, initEmailJS } from './config';

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
    
    // Initialize EmailJS
    initEmailJS();
    
    // Try direct send - standard approach
    try {
      const templateParams = {
        to_email: toEmail,
        to_name: toName,
        from_name: fromName,
        subject: subject,
        message: emailContent,
        reply_to: "noreply@mywatertechnologies.com",
        referral_code: referralCode
      };
      
      console.log("Sending email with EmailJS direct implementation");
      
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
        const minimalParams = {
          to_email: toEmail,
          to_name: toName,
          from_name: fromName,
          subject: `${fromName} invited you to try MYWATER!`,
          message: `Use code ${referralCode} for 20% off at mywater.com/products`,
        };
        
        console.log("Trying fallback email with minimal parameters");
        
        const fallbackResponse = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          minimalParams as any,
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
        await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
          status: "failed",
          attempts: 1,
          last_attempt: new Date(),
          error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        });
        
        throw new Error("Email delivery failed after multiple attempts");
      }
    }
  } catch (error) {
    console.error("Error in sendReferralEmail:", error);
    throw error;
  }
};

/**
 * Processes pending emails from Firestore
 */
export const processPendingEmailsForUI = async () => {
  try {
    console.log("Processing pending emails from Firestore");
    
    // Initialize EmailJS
    initEmailJS();
    
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
        
        // Use minimal parameters for highest delivery chance
        const simpleParams = {
          to_email: emailData.to,
          to_name: emailData.to_name || emailData.to.split('@')[0],
          from_name: emailData.from_name || "MYWATER",
          subject: emailData.subject || `Join MYWATER with a special discount!`,
          message: `${emailData.from_name || "A friend"} invites you to try MYWATER! Use code ${emailData.referral_code || "MYWATER20"} for 20% off at mywater.com/products`,
        };
        
        const response = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          simpleParams as any,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log(`Successfully sent email ${emailDoc.id}:`, response);
        
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "sent",
          sent_at: new Date(),
          attempts: (emailData.attempts || 0) + 1,
          sent_method: "retry_processor"
        });
        
        processedCount++;
        successCount++;
      } catch (error) {
        console.error(`Error processing email ${emailDoc.id}:`, error);
        
        // Update attempt counter
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
