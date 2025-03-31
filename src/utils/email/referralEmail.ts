import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { sendEmailWithEmailJS, initEmailJS } from './config';
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
    
    // Try to send the email directly with minimal parameters
    try {
      console.log(`Attempting to send simplified referral email to ${toEmail}`);
      
      // Use the direct method first (most simplified approach)
      const success = await sendEmailDirect(
        toEmail,
        toName,
        fromName,
        subject,
        emailContent
      );
      
      if (success) {
        // Update status in Firestore
        await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
          status: "sent",
          sent_at: new Date(),
          sent_method: "direct_simplified"
        });
        
        console.log("Email sent successfully via direct simplified method");
        return true;
      } else {
        throw new Error("Direct method failed");
      }
    } catch (directError) {
      console.error("Direct simplified method failed:", directError);
      
      // Mark as failed in Firestore with detailed error
      const errorMessage = directError instanceof Error 
        ? directError.message 
        : (typeof directError === 'object' ? JSON.stringify(directError) : String(directError));
      
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "failed",
        error: errorMessage,
        error_time: new Date()
      });
      
      throw new Error("All email delivery methods failed: " + errorMessage);
    }
  } catch (error) {
    console.error("Error in sendReferralEmail function:", error);
    return false;
  }
};
