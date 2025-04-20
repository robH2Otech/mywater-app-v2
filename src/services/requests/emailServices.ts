
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { sendEmailDirect } from "@/utils/email";
import { SupportRequest } from "@/types/supportRequests";

/**
 * Send an email reply to a support request
 */
export const sendReplyToRequest = async (request: SupportRequest): Promise<boolean> => {
  try {
    console.log(`Sending email to ${request.user_email}`);
    
    // First, create an entry in the emailHistory collection to track this email
    const emailHistoryRef = collection(db, "emailHistory");
    const emailData = {
      recipient: request.user_email,
      recipient_name: request.user_name,
      subject: `RE: ${request.subject}`,
      message: `Dear ${request.user_name},\n\nThank you for contacting MYWATER Support. A team member will assist you shortly.\n\nBest regards,\nMYWATER Support Team`,
      request_id: request.id,
      sent_at: new Date(),
      sent_by: "system", // This could be updated to include the current user's ID
      status: "sending"
    };
    
    const emailDoc = await addDoc(emailHistoryRef, emailData);
    
    // Now send the actual email
    await sendEmailDirect(
      request.user_email,
      request.user_name,
      "MYWATER Support",
      `RE: ${request.subject}`,
      `Dear ${request.user_name},\n\nThank you for contacting MYWATER Support. A team member will assist you shortly.\n\nBest regards,\nMYWATER Support Team`
    );
    
    // Update the email history record to show it was sent successfully
    await updateDoc(doc(db, "emailHistory", emailDoc.id), {
      status: "sent",
      sent_at: new Date() // Update with exact sent time
    });
    
    // Also update the request to show an email was sent
    const requestRef = doc(db, "support_requests", request.id);
    await updateDoc(requestRef, { 
      last_email_sent: new Date(),
      updated_at: new Date()
    });
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
