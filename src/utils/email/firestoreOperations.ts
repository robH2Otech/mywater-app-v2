
import { addDoc, updateDoc, doc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

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
