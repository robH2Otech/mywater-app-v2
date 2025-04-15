
import { addDoc, updateDoc, doc, collection } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { initEmailJS, EMAILJS_CONFIG } from '../config';
import emailjs from 'emailjs-com';

/**
 * Store email in Firestore for tracking and auditing
 */
export const storeEmailInFirestore = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string,
  emailContent: string,
  referralCode: string
) => {
  try {
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
      referral_code: referralCode,
      attempts: 0
    });
    
    console.log("Email stored in Firestore with ID:", emailDocRef.id);
    return emailDocRef;
  } catch (error) {
    console.error("Error storing email in Firestore:", error);
    throw error;
  }
};

/**
 * Send email using EmailJS with standard params
 */
export const sendDirectEmail = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string,
  message: string,
  referralCode: string,
  emailDocId: string
) => {
  try {
    // Initialize EmailJS
    initEmailJS();
    
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      subject: subject,
      message: message,
      reply_to: "noreply@mywatertechnologies.com",
      referral_code: referralCode
    };
    
    console.log("Sending email with EmailJS direct implementation");
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID, 
      templateParams as any,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    console.log("Email sent successfully:", response);
    
    // Update status in Firestore
    await updateDoc(doc(db, "emails_to_send", emailDocId), {
      status: "sent",
      sent_at: new Date(),
      attempts: 1,
      sent_method: "direct"
    });
    
    return { success: true, response };
  } catch (error) {
    console.error("Error sending direct email:", error);
    throw error;
  }
};

/**
 * Send email with minimal parameters as fallback
 */
export const sendFallbackEmail = async (
  toEmail: string,
  toName: string,
  fromName: string,
  referralCode: string,
  emailDocId: string
) => {
  try {
    // Initialize EmailJS
    initEmailJS();
    
    const minimalParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      subject: `${fromName} invited you to try MYWATER!`,
      message: `Use code ${referralCode} for 20% off at mywater.com/products`,
    };
    
    console.log("Trying fallback email with minimal parameters");
    
    const fallbackResponse = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      minimalParams as any,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    console.log("Fallback email sent successfully:", fallbackResponse);
    
    await updateDoc(doc(db, "emails_to_send", emailDocId), {
      status: "sent",
      sent_at: new Date(),
      attempts: 1,
      sent_method: "fallback"
    });
    
    return { success: true, response: fallbackResponse };
  } catch (error) {
    console.error("Error sending fallback email:", error);
    throw error;
  }
};

/**
 * Update email status to failed in Firestore
 */
export const markEmailAsFailed = async (emailDocId: string, error: any) => {
  try {
    await updateDoc(doc(db, "emails_to_send", emailDocId), {
      status: "failed",
      attempts: 1,
      last_attempt: new Date(),
      error: error instanceof Error ? error.message : String(error)
    });
    console.log("Email marked as failed in Firestore");
  } catch (updateError) {
    console.error("Error updating email status:", updateError);
  }
};
