
import { query, where, getDocs, collection } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { generateReferralEmailTemplate } from './templates';
import { 
  storeEmailInFirestore, 
  sendDirectEmail, 
  sendFallbackEmail,
  markEmailAsFailed
} from './services/referralEmailService';

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

    // Try direct send - standard approach
    try {
      const result = await sendDirectEmail(
        toEmail,
        toName,
        fromName,
        subject,
        emailContent,
        referralCode,
        emailDocRef.id
      );
      
      return {
        success: true,
        message: "Email sent successfully",
        emailId: emailDocRef.id
      };
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Try simplified approach as fallback
      try {
        const fallbackResult = await sendFallbackEmail(
          toEmail,
          toName,
          fromName,
          referralCode,
          emailDocRef.id
        );
        
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
 * Processes pending emails from Firestore
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
    
    // Process each email using services
    for (const emailDoc of pendingSnapshot.docs) {
      const emailData = emailDoc.data();
      
      try {
        console.log(`Retrying email ${emailDoc.id} to ${emailData.to}`);
        
        // Try to send the email with simplified parameters
        await sendFallbackEmail(
          emailData.to,
          emailData.to_name || emailData.to.split('@')[0],
          emailData.from_name || "MYWATER",
          emailData.referral_code || "MYWATER20",
          emailDoc.id
        );
        
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
