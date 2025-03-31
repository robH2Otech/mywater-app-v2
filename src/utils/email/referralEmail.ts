import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { sendEmailWithEmailJS } from './config';
import { generateReferralEmailTemplate } from './templates';
import { sendEmailDirect } from './directEmail';

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
    
    // Send the email using EmailJS
    try {
      console.log(`Attempting to send referral email to ${toEmail} from ${fromName}`);
      
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
        sent_at: new Date()
      });
      
      console.log("Email sent successfully and status updated in Firestore");
      return true;
    } catch (emailError) {
      console.error("Error sending email with primary method:", emailError);
      
      // Convert any error to proper string format for Firestore
      const errorMessage = emailError instanceof Error 
        ? emailError.message 
        : (typeof emailError === 'object' ? JSON.stringify(emailError) : String(emailError));
      
      console.log("Using formatted error message:", errorMessage);
      
      // Update status in Firestore with proper error message
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "failed",
        error: errorMessage,
        error_time: new Date()
      });
      
      // Try fallback method
      console.log("Attempting fallback email delivery method");
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
          sent_at: new Date()
        });
        console.log("Email sent via fallback method");
        return true;
      }
      
      console.error("All email delivery methods failed");
      return false;
    }
  } catch (error) {
    console.error("Error in sendReferralEmail function:", error);
    return false;
  }
};
