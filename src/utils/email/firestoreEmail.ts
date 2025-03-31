
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { sendEmailWithEmailJS } from './config';
import { sendEmailDirect } from './directEmail';

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
        
        // Send the email using EmailJS
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
          attempts: (emailData.attempts || 0) + 1
        });
        
        processedCount++;
        successCount++;
        console.log(`Email ${emailDoc.id} sent successfully`);
      } catch (sendError) {
        console.error(`Error processing email ${emailDoc.id}:`, sendError);
        
        // Convert error to string to prevent [object Object] in Firestore
        const errorMessage = sendError instanceof Error 
          ? sendError.message 
          : (typeof sendError === 'object' ? JSON.stringify(sendError) : String(sendError));
        
        console.log(`Trying fallback method for email ${emailDoc.id}`);
        
        // Try fallback method
        try {
          const fallbackSuccess = await sendEmailDirect(
            emailData.to,
            emailData.to_name || emailData.to,
            emailData.from_name,
            emailData.subject,
            emailData.body,
            { referral_code: emailData.referral_code }
          );
          
          if (fallbackSuccess) {
            await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
              status: "sent_via_fallback",
              sent_at: new Date(),
              attempts: (emailData.attempts || 0) + 1,
              error: errorMessage,
              recovery: "Sent via fallback method"
            });
            processedCount++;
            successCount++;
            console.log(`Email ${emailDoc.id} sent successfully via fallback`);
          } else {
            throw new Error("Fallback method also failed");
          }
        } catch (fallbackError) {
          // Mark as failed with proper error message
          await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
            status: "failed",
            error: errorMessage,
            attempts: (emailData.attempts || 0) + 1,
            last_attempt: new Date()
          });
          processedCount++;
        }
      }
    }
    
    console.log(`Processed ${processedCount} emails, ${successCount} sent successfully`);
    return { total: processedCount, success: successCount };
  } catch (error) {
    console.error("Error processing emails:", error);
    return { total: 0, success: 0, error: String(error) };
  }
};
