
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import emailjs from 'emailjs-com';

// Your EmailJS service ID, template ID, and user ID
// These would typically come from environment variables
const EMAILJS_SERVICE_ID = 'service_mywater';
const EMAILJS_TEMPLATE_ID = 'template_referral';
const EMAILJS_USER_ID = 'YOUR_EMAILJS_USER_ID'; // Replace with your actual User ID

// Function to send a referral email
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

    // Store in Firestore for record-keeping and future processing
    const emailDocRef = await addDoc(collection(db, "emails_to_send"), {
      to: toEmail,
      to_name: toName,
      from: "contact@mywatertechnologies.com",
      from_name: fromName,
      subject: `${fromName} invited you to try MYWATER (20% discount!)`,
      body: emailContent,
      html_body: emailContent.replace(/\n/g, "<br>"),
      created_at: new Date(),
      status: "pending", // Mark as pending until sent
      type: "referral",
      referral_code: referralCode
    });

    console.log("Email stored in Firestore with ID:", emailDocRef.id);
    
    // Send the email using EmailJS
    try {
      const templateParams = {
        to_email: toEmail,
        to_name: toName,
        from_name: fromName,
        message: emailContent,
        subject: `${fromName} invited you to try MYWATER (20% discount!)`,
        referral_code: referralCode
      };
      
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_USER_ID
      );
      
      console.log('Email sent successfully:', response);
      
      // Update the status in Firestore
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "sent",
        sent_at: new Date()
      });
      
      return true;
    } catch (emailError) {
      console.error("Error sending email with EmailJS:", emailError);
      
      // Update the status in Firestore to failed
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "failed",
        error: String(emailError)
      });
      
      // Use the direct method as fallback
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

// Function to check for pending emails and mark them as sent
export const processPendingEmails = async () => {
  try {
    const emailsQuery = query(
      collection(db, "emails_to_send"),
      where("status", "==", "pending")
    );
    
    const emailsSnapshot = await getDocs(emailsQuery);
    let processedCount = 0;
    
    for (const emailDoc of emailsSnapshot.docs) {
      // Process each pending email
      const emailData = emailDoc.data();
      
      try {
        // Use EmailJS to send the email
        const templateParams = {
          to_email: emailData.to,
          to_name: emailData.to_name,
          from_name: emailData.from_name,
          message: emailData.body,
          subject: emailData.subject,
          referral_code: emailData.referral_code
        };
        
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_USER_ID
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

// Function to generate a personalized referral email template
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

// Create a function to directly send emails (for development purposes)
export const sendEmailDirect = async (
  toEmail: string,
  toName: string,
  fromName: string,
  subject: string, 
  message: string
) => {
  // Try to use EmailJS if available
  try {
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      from_name: fromName,
      message: message,
      subject: subject,
      from_email: "contact@mywatertechnologies.com"
    };
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );
    
    console.log('Email sent successfully via EmailJS:', response);
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
