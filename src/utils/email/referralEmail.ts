
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { EMAILJS_CONFIG, initEmailJS } from './config';
import { generateReferralEmailTemplate } from './templates';
import emailjs from 'emailjs-com';
import { processPendingEmails } from './firestoreEmail';

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
      
      // Prepare email parameters with additional debugging
      console.log("EmailJS Config:", {
        serviceId: EMAILJS_CONFIG.SERVICE_ID,
        templateId: EMAILJS_CONFIG.TEMPLATE_ID,
        userId: EMAILJS_CONFIG.USER_ID
      });
      
      const emailParams = {
        to_email: toEmail,
        to_name: toName,
        from_name: fromName,
        subject: subject,
        message: emailContent.replace(/<br>/g, '\n').replace(/<[^>]*>/g, ''),
        referral_code: referralCode,
        reply_to: "noreply@mywatertechnologies.com"
      };
      
      console.log("Sending with params:", JSON.stringify(emailParams));
      
      // Send using EmailJS API directly with updated error handling
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
      console.error("Error sending referral email with direct method:", error);
      
      // Try alternative method
      try {
        // Create stripped-down message for compatibility
        const simpleMessage = `${fromName} has invited you to try MYWATER with a 20% discount! Use code ${referralCode} at https://mywater.com/products`;
        
        // Try with minimal parameters
        const minimalParams = {
          to_email: toEmail,
          to_name: toName,
          from_name: fromName,
          message: simpleMessage,
          subject: subject
        };
        
        console.log("Trying with minimal parameters:", JSON.stringify(minimalParams));
        
        const response = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          minimalParams,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log("Email sent successfully via minimal params:", response);
        
        await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
          status: "sent",
          sent_at: new Date(),
          sent_method: "emailjs_minimal"
        });
        
        return true;
      } catch (fallbackError) {
        console.error("Fallback method also failed:", fallbackError);
        
        // Keep as pending for background processing
        console.log("Email will be processed by background function");
        
        // Trigger background processing immediately
        try {
          await processPendingEmails();
        } catch (procError) {
          console.error("Error during immediate processing attempt:", procError);
        }
        
        // Return true for better UX - the email is in the system and will be attempted
        return true;
      }
    }
  } catch (error) {
    console.error("Error in sendReferralEmail function:", error);
    throw new Error("Failed to send referral email");
  }
};

/**
 * Automatically attempts to process any pending emails
 */
export const processPendingEmailsForUI = async () => {
  try {
    // Find all pending emails in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const pendingQuery = query(
      collection(db, "emails_to_send"),
      where("status", "==", "pending"),
      where("created_at", ">=", oneDayAgo)
    );
    
    const pendingSnapshot = await getDocs(pendingQuery);
    console.log(`Found ${pendingSnapshot.docs.length} recent pending emails to process`);
    
    for (const emailDoc of pendingSnapshot.docs) {
      const emailData = emailDoc.data();
      
      try {
        // Initialize EmailJS
        initEmailJS();
        
        // Create a simplified message that's most likely to work
        const simpleParams = {
          to_email: emailData.to,
          to_name: emailData.to_name || emailData.to,
          from_name: emailData.from_name,
          subject: emailData.subject,
          message: `${emailData.from_name} has invited you to try MYWATER with a 20% discount! Use code ${emailData.referral_code} when you purchase at https://mywater.com/products`,
          reply_to: "noreply@mywatertechnologies.com"
        };
        
        console.log(`Attempting to send pending email ${emailDoc.id} to ${emailData.to}`);
        
        const response = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          simpleParams,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log(`Successfully sent pending email ${emailDoc.id}:`, response);
        
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "sent",
          sent_at: new Date(),
          attempts: (emailData.attempts || 0) + 1,
          sent_method: "auto_processor"
        });
      } catch (error) {
        console.error(`Error processing email ${emailDoc.id}:`, error);
        
        // Update the attempt counter but keep as pending
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          attempts: (emailData.attempts || 0) + 1,
          last_attempt: new Date()
        });
      }
    }
    
    return pendingSnapshot.docs.length;
  } catch (error) {
    console.error("Error in processPendingEmailsForUI:", error);
    return 0;
  }
};
