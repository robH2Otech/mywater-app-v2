
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

    // Store in Firestore for record-keeping
    const emailDocRef = await addDoc(collection(db, "emails_to_send"), {
      to: toEmail,
      to_name: toName,
      from: "contact@mywatertechnologies.com",
      from_name: fromName,
      subject: `${fromName} invited you to try MYWATER (20% discount!)`,
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
      // Convert error objects to strings to prevent [object Object] in Firestore
      const response = await sendEmailWithEmailJS(
        toEmail,
        toName,
        fromName,
        `${fromName} invited you to try MYWATER (20% discount!)`,
        emailContent,
        { referral_code: referralCode }
      );
      
      // Update status in Firestore
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "sent",
        sent_at: new Date()
      });
      
      console.log("Email sent and status updated in Firestore");
      return true;
    } catch (emailError) {
      console.error("Error sending email with EmailJS:", emailError);
      
      // Convert error object to string to avoid [object Object] in Firestore
      const errorMessage = typeof emailError === 'object' ? 
        (emailError instanceof Error ? emailError.message : JSON.stringify(emailError)) : 
        String(emailError);
      
      // Update status in Firestore to failed with proper error message
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "failed",
        error: errorMessage
      });
      
      // Use direct method as fallback
      return await sendEmailDirect(
        toEmail,
        toName,
        fromName,
        `${fromName} invited you to try MYWATER (20% discount!)`,
        emailContent
      );
    }
  } catch (error) {
    console.error("Error sending referral email:", error);
    return false;
  }
};
