import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import emailjs from 'emailjs-com';

// EmailJS configuration with the provided credentials
const EMAILJS_SERVICE_ID = 'service_mywater';
const EMAILJS_TEMPLATE_ID = 'template_referral';
const EMAILJS_USER_ID = '20lKGYgYsf1DIICqM'; 

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
      
      return true;
    } catch (emailError) {
      console.error("Error sending email with EmailJS:", emailError);
      
      // Update status in Firestore to failed
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "failed",
        error: String(emailError)
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

/**
 * Sends an email directly to the recipient
 */
export const sendEmailDirect = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string, 
  message: string
) => {
  // Try to use EmailJS if available
  try {
    await sendEmailWithEmailJS(toEmail, toName, fromName, subject, message);
    console.log('Email sent successfully via EmailJS');
    return true;
  } catch (emailJsError) {
    console.error("Error sending via EmailJS:", emailJsError);
    
    // Fallback to simulation if EmailJS fails
    console.log("Direct email sending (simulated):", {
      to: toEmail,
      toName,
      fromName,
      subject,
      message,
      from: "contact@mywatertechnologies.com"
    });
    
    // For development only - simulate email delivery
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Email delivered (simulated)");
        resolve(true);
      }, 1500);
    });
  }
};

/**
 * Helper function to send emails using EmailJS
 */
const sendEmailWithEmailJS = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string,
  message: string,
  additionalParams: Record<string, any> = {}
) => {
  const templateParams = {
    to_email: toEmail,
    to_name: toName,
    from_name: fromName,
    message: message,
    subject: subject,
    from_email: "contact@mywatertechnologies.com",
    ...additionalParams
  };
  
  return await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    EMAILJS_USER_ID
  );
};

/**
 * Generates a template for referral emails
 */
export const generateReferralEmailTemplate = (
  toName: string,
  fromName: string,
  referralCode: string
) => {
  return `Hi ${toName || "[Friend's Name]"},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this link: https://mywater.com/refer?code=${referralCode} when you purchase.

If you decide to get a MYWATER system, you'll also get the chance to refer 3 friends and earn a free replacement cartridge for yourself!

Check it out here: https://mywater.com/products

Best,
${fromName || "[Your Name]"}`;
};

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
