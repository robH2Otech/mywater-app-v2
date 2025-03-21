
import { collection, addDoc, getDocs, query, where, Timestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

// Function to send a referral email (in a real app, this would connect to a backend)
export const sendReferralEmail = async (
  toEmail: string,
  toName: string,
  fromName: string,
  referralCode: string
) => {
  try {
    const emailContent = `Hi ${toName},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this link: https://mywater.com/refer?code=${referralCode} when you purchase.

If you decide to get a MYWATER system, you'll also get the chance to refer 3 friends and earn a free replacement cartridge for yourself!

Check it out here: https://mywater.com/products

Best,
${fromName}`;

    // In a real app, this would connect to an email sending service
    // For now, we'll store it in Firestore for demonstration
    await addDoc(collection(db, "emails_to_send"), {
      to: toEmail,
      to_name: toName,
      from: "noreply@mywater.com",
      from_name: fromName,
      subject: `${fromName} invited you to try MYWATER (20% discount!)`,
      body: emailContent,
      html_body: emailContent.replace(/\n/g, "<br>"),
      created_at: new Date(),
      status: "pending",
      type: "referral"
    });

    return true;
  } catch (error) {
    console.error("Error sending referral email:", error);
    return false;
  }
};

// Function to check for pending emails and mark them as sent
// In a real app, this would be a background job or cloud function
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
