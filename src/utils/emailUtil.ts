import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

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
      from: "referrals@mywater.com",
      from_name: fromName,
      subject: `${fromName} invited you to try MYWATER (20% discount!)`,
      body: emailContent,
      html_body: emailContent.replace(/\n/g, "<br>"),
      created_at: new Date(),
      status: "sent", // Mark as sent since we're using a direct method now
      type: "referral",
      referral_code: referralCode
    });

    console.log("Email stored in Firestore with ID:", emailDocRef.id);
    
    // In production, this would use a proper email service
    // For now, we're using a direct method in the component
    
    return true;
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
    
    for (const emailDoc of emailsSnapshot.docs) {
      // Process each pending email
      const emailData = emailDoc.data();
      
      try {
        // In a real production app, this would trigger an API call to send the email
        // For now, we'll just mark it as sent
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "sent",
          sent_at: new Date()
        });
      } catch (sendError) {
        console.error("Error processing email:", sendError);
        // Mark as failed
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "failed",
          error: String(sendError)
        });
      }
    }
    
    return emailsSnapshot.docs.length;
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
  // This is a placeholder for a direct email sending method
  // In production, this would integrate with a service like SendGrid, Mailgun, etc.
  console.log("Direct email sending:", {
    to: toEmail,
    toName,
    fromName,
    subject,
    message
  });
  
  // For development only - simulate email delivery
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Email delivered (simulated)");
      resolve(true);
    }, 1500);
  });
};
