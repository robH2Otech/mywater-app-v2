import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { EMAILJS_CONFIG, initEmailJS } from './config';
import { generateReferralEmailTemplate } from './templates';
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

    // Store in Firestore for record-keeping and tracking
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
      referral_code: referralCode
    });

    console.log("Email stored in Firestore with ID:", emailDocRef.id);
    
    // Try to send the email directly with EmailJS
    try {
      console.log(`Sending referral email to ${toEmail} using EmailJS direct API`);
      
      // Initialize EmailJS
      initEmailJS();
      
      // Prepare email parameters
      const emailParams = {
        to_email: toEmail,
        to_name: toName,
        from_name: fromName,
        subject: subject,
        message: emailContent.replace(/<br>/g, '\n').replace(/<[^>]*>/g, ''),
        referral_code: referralCode,
        reply_to: "noreply@mywatertechnologies.com"
      };
      
      // Send using EmailJS API directly
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        emailParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      console.log("Email sent successfully via EmailJS API:", response);
      
      // Update status in Firestore
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "sent",
        sent_at: new Date(),
        sent_method: "emailjs_direct"
      });
      
      return true;
    } catch (error) {
      // Try fallback method through Firestore triggered function
      console.error("Error sending referral email with direct method:", error);
      
      // Keep the email in Firestore with 'pending' status
      // A Cloud Function will process it later
      console.log("Email will be processed by background function");
      
      // Simulate success for better UX - the Cloud Function will handle it
      return true;
    }
  } catch (error) {
    console.error("Error in sendReferralEmail function:", error);
    throw new Error("Failed to send referral email");
  }
};
