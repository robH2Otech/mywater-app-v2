
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
    // Default email template if none provided
    const defaultEmailContent = `Hi ${toName},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this link: https://mywater.com/refer?code=${referralCode} when you purchase.

If you decide to get a MYWATER system, you'll also get the chance to refer 3 friends and earn a free replacement cartridge for yourself!

Check it out here: https://mywater.com/products

Best,
${fromName}`;

    // Use custom message if provided, otherwise use default
    const emailContent = customMessage || defaultEmailContent;

    // In a real app, this would connect to an email sending service
    // For now, we'll store it in Firestore for demonstration
    const emailDocRef = await addDoc(collection(db, "emails_to_send"), {
      to: toEmail,
      to_name: toName,
      from: "referrals@mywater.com",
      from_name: fromName,
      subject: `${fromName} invited you to try MYWATER (20% discount!)`,
      body: emailContent,
      html_body: emailContent.replace(/\n/g, "<br>"),
      created_at: new Date(),
      status: "pending",
      type: "referral"
    });

    console.log("Email stored in Firestore with ID:", emailDocRef.id);
    
    // For demonstration, we'll immediately mark it as "sent"
    await updateDoc(emailDocRef, {
      status: "sent",
      sent_at: new Date()
    });
    
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
      const emailData = emailDoc.data();
      
      // In a real app, this would connect to an email sending service
      console.log(`Email would be sent to ${emailData.to} with subject: ${emailData.subject}`);
      
      // Mark as sent
      await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
        status: "sent",
        sent_at: new Date()
      });
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
  return `Hi ${toName},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this link: https://mywater.com/refer?code=${referralCode} when you purchase.

If you decide to get a MYWATER system, you'll also get the chance to refer 3 friends and earn a free replacement cartridge for yourself!

Check it out here: https://mywater.com/products

Best,
${fromName}`;
};
