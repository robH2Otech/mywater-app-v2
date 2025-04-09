
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { EMAILJS_CONFIG, initEmailJS } from './config';
import { generateReferralEmailTemplate } from './templates';
import emailjs from 'emailjs-com';
import { processPendingEmails } from './firestoreEmail';

/**
 * Sends a referral email to the specified recipient with fallback mechanisms
 */
export const sendReferralEmail = async (
  toEmail: string,
  toName: string,
  fromName: string,
  referralCode: string,
  customMessage?: string
) => {
  try {
    // Initialize EmailJS first
    initEmailJS();
    
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
    
    // Attempt immediate email delivery with multiple backup methods
    
    // Method 1: Direct send with complete template
    try {
      console.log("Attempting direct EmailJS send with complete template");
      
      const emailParams = {
        to_email: toEmail,
        to_name: toName,
        from_name: fromName,
        subject: subject,
        message: emailContent,
        referral_code: referralCode,
        reply_to: "noreply@mywatertechnologies.com"
      };
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        emailParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      console.log("✅ Email sent successfully via direct method:", response);
      
      // Update status in Firestore
      await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
        status: "sent",
        sent_at: new Date(),
        sent_method: "direct"
      });
      
      return true;
    } catch (directError) {
      console.error("Direct method failed:", directError);
      
      // Method 2: Simplified template with essential info only
      try {
        console.log("Attempting with simplified template");
        
        const simpleMessage = `${fromName} has invited you to try MYWATER with a 20% discount!\n\nUse code ${referralCode} when you purchase at https://mywater.com/products`;
        
        const minimalParams = {
          to_email: toEmail,
          to_name: toName,
          from_name: fromName,
          message: simpleMessage,
          subject: subject
        };
        
        const response = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          minimalParams,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log("✅ Email sent successfully via simplified template:", response);
        
        await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
          status: "sent",
          sent_at: new Date(),
          sent_method: "simplified"
        });
        
        return true;
      } catch (simplifiedError) {
        console.error("Simplified template method failed:", simplifiedError);
        
        // Method 3: Use the most minimal params possible
        try {
          console.log("Attempting with minimal params");
          
          // Absolute minimum required fields for EmailJS
          const bareMinimumParams = {
            to_email: toEmail,
            from_name: fromName,
            message: `Use code ${referralCode} for 20% off MYWATER: https://mywater.com/products`
          };
          
          const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            bareMinimumParams,
            EMAILJS_CONFIG.PUBLIC_KEY
          );
          
          console.log("✅ Email sent successfully via minimal params:", response);
          
          await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
            status: "sent",
            sent_at: new Date(),
            sent_method: "minimal"
          });
          
          return true;
        } catch (minimalError) {
          console.error("All direct methods failed. Marking for background processing:", minimalError);
          
          // We'll let the background processor try later
          await updateDoc(doc(db, "emails_to_send", emailDocRef.id), {
            attempts: 1,
            last_attempt: new Date()
          });
          
          // Immediately try background processing
          processPendingEmailsForUI();
          
          // Tell the user it's been queued but return true for better UX
          return true;
        }
      }
    }
  } catch (error) {
    console.error("Error in sendReferralEmail function:", error);
    throw new Error("Failed to send referral email");
  }
};

/**
 * Automatically attempts to process any pending emails
 * This is a simplified version that focuses on immediate delivery
 */
export const processPendingEmailsForUI = async () => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Get recent pending emails (last 24 hours)
    const pendingQuery = query(
      collection(db, "emails_to_send"),
      where("status", "==", "pending"),
      where("created_at", ">=", oneDayAgo)
    );
    
    const pendingSnapshot = await getDocs(pendingQuery);
    console.log(`Found ${pendingSnapshot.docs.length} recent pending emails to process`);
    
    let processedCount = 0;
    let successCount = 0;
    
    // Process each email with robust error handling
    for (const emailDoc of pendingSnapshot.docs) {
      const emailData = emailDoc.data();
      
      try {
        // Initialize EmailJS
        initEmailJS();
        
        // Try with the most minimal configuration possible
        const simpleParams = {
          to_email: emailData.to,
          to_name: emailData.to_name || emailData.to,
          from_name: emailData.from_name,
          subject: emailData.subject,
          message: `${emailData.from_name} invites you to try MYWATER! Use code ${emailData.referral_code} for 20% off at https://mywater.com/products`,
        };
        
        console.log(`Processing pending email ${emailDoc.id} to ${emailData.to}`);
        
        const response = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          simpleParams,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log(`Successfully processed email ${emailDoc.id}:`, response);
        
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          status: "sent",
          sent_at: new Date(),
          attempts: (emailData.attempts || 0) + 1,
          sent_method: "background_processor"
        });
        
        processedCount++;
        successCount++;
      } catch (error) {
        console.error(`Error processing email ${emailDoc.id}:`, error);
        
        // Update the attempt counter but keep as pending
        await updateDoc(doc(db, "emails_to_send", emailDoc.id), {
          attempts: (emailData.attempts || 0) + 1,
          last_attempt: new Date(),
          error: error instanceof Error ? error.message : String(error)
        });
        
        processedCount++;
      }
    }
    
    console.log(`Processed ${processedCount} emails, ${successCount} sent successfully`);
    return successCount;
  } catch (error) {
    console.error("Error in processPendingEmailsForUI:", error);
    return 0;
  }
};
