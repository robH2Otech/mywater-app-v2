
import { collection, addDoc, getDocs, query, where, Timestamp, updateDoc, doc } from "firebase/firestore";
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
      status: "pending",
      type: "referral",
      referral_code: referralCode
    });

    console.log("Email stored in Firestore with ID:", emailDocRef.id);
    
    // In a real app, this would trigger a cloud function or webhook to send the email
    // Let's trigger email sending directly for demonstration
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'default_service',
        template_id: 'mywater_referral',
        user_id: 'user_id', // This would normally be your EmailJS user ID
        template_params: {
          to_email: toEmail,
          to_name: toName,
          from_name: fromName,
          message: emailContent,
          referral_code: referralCode,
          subject: `${fromName} invited you to try MYWATER (20% discount!)`
        }
      }),
    });

    // Mark as sent in Firestore
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
      // Process each pending email
      const emailData = emailDoc.data();
      
      // Attempt to send via email service
      try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: 'default_service',
            template_id: 'mywater_referral',
            user_id: 'user_id', // This would normally be your EmailJS user ID
            template_params: {
              to_email: emailData.to,
              to_name: emailData.to_name,
              from_name: emailData.from_name,
              message: emailData.body,
              referral_code: emailData.referral_code,
              subject: emailData.subject
            }
          }),
        });
        
        // Mark as sent
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "sent",
          sent_at: new Date()
        });
      } catch (sendError) {
        console.error("Error sending email:", sendError);
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
