
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { sendEmailWithEmailJS, EMAILJS_CONFIG, initEmailJS } from './config';
import { sendEmailDirect } from './directEmail';
import emailjs from 'emailjs-com';

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
        // Method 1: Using sendEmailWithEmailJS helper function
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
        } catch (primaryError) {
          console.error(`Primary method failed for email ${emailDoc.id}:`, primaryError);
          
          // Method 2: Try direct method using emailjs.send
          try {
            console.log(`Trying direct EmailJS method for email ${emailDoc.id}`);
            
            // Initialize EmailJS if needed
            initEmailJS();
            
            const cleanMessage = emailData.body.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');
            
            const templateParams = {
              to_email: emailData.to,
              to_name: emailData.to_name || emailData.to,
              from_name: emailData.from_name,
              message: cleanMessage,
              subject: emailData.subject,
              from_email: emailData.from || "contact@mywatertechnologies.com",
              referral_code: emailData.referral_code
            };
            
            await emailjs.send(
              EMAILJS_CONFIG.SERVICE_ID,
              EMAILJS_CONFIG.TEMPLATE_ID,
              templateParams,
              EMAILJS_CONFIG.PUBLIC_KEY
            );
            
            await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
              status: "sent",
              sent_at: new Date(),
              attempts: (emailData.attempts || 0) + 1,
              sent_method: "direct"
            });
            
            processedCount++;
            successCount++;
            console.log(`Email ${emailDoc.id} sent successfully via direct method`);
            continue;
          } catch (directError) {
            console.error(`Direct method failed for email ${emailDoc.id}:`, directError);
            
            // Method 3: Try fallback method
            try {
              console.log(`Trying fallback method for email ${emailDoc.id}`);
              const fallbackSuccess = await sendEmailDirect(
                emailData.to,
                emailData.to_name || emailData.to,
                emailData.from_name,
                emailData.subject,
                emailData.body
              );
              
              if (fallbackSuccess) {
                await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
                  status: "sent_via_fallback",
                  sent_at: new Date(),
                  attempts: (emailData.attempts || 0) + 1,
                  sent_method: "fallback"
                });
                processedCount++;
                successCount++;
                console.log(`Email ${emailDoc.id} sent successfully via fallback method`);
                continue;
              }
              
              throw new Error("Fallback method also failed");
            } catch (fallbackError) {
              // All methods failed, mark as failed with proper error message
              const errorMessage = fallbackError instanceof Error 
                ? fallbackError.message 
                : (typeof fallbackError === 'object' ? JSON.stringify(fallbackError) : String(fallbackError));
              
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
