
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { sendEmailWithEmailJS } from './config';

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
    
    for (const emailDoc of emailsSnapshot.docs) {
      const emailData = emailDoc.data();
      
      try {
        console.log(`Processing email ${emailDoc.id} to ${emailData.to}`);
        
        // Send the email using EmailJS
        await sendEmailWithEmailJS(
          emailData.to,
          emailData.to_name,
          emailData.from_name,
          emailData.subject,
          emailData.body,
          { referral_code: emailData.referral_code }
        );
        
        // Mark as sent
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "sent",
          sent_at: new Date()
        });
        
        processedCount++;
        console.log(`Email ${emailDoc.id} sent successfully`);
      } catch (sendError) {
        console.error(`Error processing email ${emailDoc.id}:`, sendError);
        
        // Convert error to string to prevent [object Object] in Firestore
        const errorMessage = typeof sendError === 'object' ? 
          (sendError instanceof Error ? sendError.message : JSON.stringify(sendError)) : 
          String(sendError);
        
        // Mark as failed with proper error message
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "failed",
          error: errorMessage
        });
      }
    }
    
    return processedCount;
  } catch (error) {
    console.error("Error processing emails:", error);
    return 0;
  }
};
