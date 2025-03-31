import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { sendEmailWithEmailJS, EMAILJS_CONFIG } from './config';
import { generateReferralEmailTemplate } from './templates';
import { sendEmailDirect } from './directEmail';
import emailjs from 'emailjs-com';

/**
 * Sends a referral email to the specified recipient
 */
export const sendReferralEmail = async (
  toEmail: string,
  toName: string,
  fromName: string,
  referralCode: string,
  customMessage?: string
) => {
  try {
    // Generate default message if none provided
    const emailContent = customMessage || generateReferralEmailTemplate(toName, fromName, referralCode);
    const subject = `${fromName} invited you to try MYWATER (20% discount!)`;

    // Store in Firestore for record-keeping
    const emailDocRef = await addDoc(collection(db, "emails_to_send"), {
      to: toEmail,
      to_name: toName,
      from: "contact@mywatertechnologies.com",
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
    
    // Try different methods to send the email
    try {
      console.log(`Attempting to send referral email to ${toEmail} from ${fromName}`);
      
      // Method 1: Using sendEmailWithEmailJS helper function
      try {
        const response = await sendEmailWithEmailJS(
          toEmail,
          toName,
          fromName,
          subject,
          emailContent,
          { referral_code: referralCode }
        );
        
        // Update status in Firestore
        await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
          status: "sent",
          sent_at: new Date(),
          sent_method: "primary"
        });
        
        console.log("Email sent successfully via primary method");
        return true;
      } catch (primaryError) {
        console.error("Primary method failed:", primaryError);
        
        // Method 2: Try direct method using emailjs.send with explicit parameters
        try {
          console.log("Trying direct EmailJS method");
          
          if (!emailjs.isInitialized) {
            emailjs.init(EMAILJS_CONFIG.USER_ID);
          }
          
          const cleanMessage = emailContent.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');
          
          const templateParams = {
            to_email: toEmail,
            to_name: toName,
            from_name: fromName,
            message: cleanMessage,
            subject: subject,
            from_email: "contact@mywatertechnologies.com",
            referral_code: referralCode
          };
          
          const directResponse = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams,
            EMAILJS_CONFIG.PUBLIC_KEY
          );
          
          console.log("Email sent successfully via direct method:", directResponse);
          
          await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
            status: "sent",
            sent_at: new Date(),
            sent_method: "direct"
          });
          
          return true;
        } catch (directError) {
          console.error("Direct method failed:", directError);
          
          // Method 3: Try fallback method
          console.log("Trying fallback email delivery method");
          const fallbackSuccess = await sendEmailDirect(
            toEmail,
            toName,
            fromName,
            subject,
            emailContent,
            { referral_code: referralCode }
          );
          
          if (fallbackSuccess) {
            await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
              status: "sent_via_fallback",
              sent_at: new Date(),
              sent_method: "fallback"
            });
            console.log("Email sent via fallback method");
            return true;
          }
          
          // If all methods fail, update status to failed with detailed error
          const errorMessage = directError instanceof Error 
            ? directError.message 
            : (typeof directError === 'object' ? JSON.stringify(directError) : String(directError));
          
          await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
            status: "failed",
            error: errorMessage,
            error_time: new Date()
          });
          
          console.error("All email delivery methods failed");
          throw new Error("All email delivery methods failed: " + errorMessage);
        }
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      
      // Convert any error to proper string format for Firestore
      const errorMessage = emailError instanceof Error 
        ? emailError.message 
        : (typeof emailError === 'object' ? JSON.stringify(emailError) : String(emailError));
      
      // Update status in Firestore with proper error message
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "failed",
        error: errorMessage,
        error_time: new Date()
      });
      
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error in sendReferralEmail function:", error);
    return false;
  }
};
