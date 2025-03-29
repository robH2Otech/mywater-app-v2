
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
      } catch (sendError) {
        console.error("Error processing email:", sendError);
        // Mark as failed
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "failed",
          error: String(sendError)
        });
      }
    }
    
    return processedCount;
  } catch (error) {
    console.error("Error processing emails:", error);
    return 0;
  }
};
