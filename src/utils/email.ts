
import { db } from "@/integrations/firebase/client";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { toast } from "sonner";

// Email sending utility function
export const sendEmailDirect = async (
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  subject: string,
  message: string,
  requestId?: string
) => {
  console.log(`Attempting to send email to ${recipientEmail}`);
  
  try {
    // Create record in emailHistory collection
    const emailHistoryRef = collection(db, "emailHistory");
    const emailData = {
      recipient: recipientEmail,
      recipient_name: recipientName,
      subject: subject,
      message: message,
      request_id: requestId || null,
      sent_at: new Date(),
      sent_by: senderName,
      status: "pending"
    };
    
    // Add the email to the history
    const emailDoc = await addDoc(emailHistoryRef, emailData);
    console.log("Email history record created:", emailDoc.id);
    
    // In a real app, this would connect to a backend service to send the email
    // For this demo, we'll simulate sending via Firebase Functions
    
    // For demonstration, we'll simply update the status to "sent" after a short delay
    setTimeout(async () => {
      try {
        // Update the email history record to show it was sent successfully
        await updateDoc(doc(db, "emailHistory", emailDoc.id), {
          status: "sent",
          sent_at: new Date() // Update with exact sent time
        });
        
        // If we have a request ID, update the request as well
        if (requestId) {
          const requestRef = doc(db, "support_requests", requestId);
          await updateDoc(requestRef, { 
            last_email_sent: new Date(),
            updated_at: new Date()
          });
        }
        
        console.log("Email marked as sent successfully");
        toast.success("Email sent successfully");
      } catch (error) {
        console.error("Error updating email status:", error);
        toast.error("Error updating email status");
      }
    }, 1500);
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    toast.error("Failed to send email");
    throw error;
  }
};
