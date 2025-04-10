
import { useState } from "react";
import { sendReferralEmail, processPendingEmailsForUI } from "@/utils/email";
import { useToast } from "@/hooks/use-toast";

export function useReferralTracking(
  friendName: string, 
  friendEmail: string,
  userName: string,
  referralCode: string,
  emailMessage: string,
  setFriendName: (value: string) => void,
  setFriendEmail: (value: string) => void,
  setEmailMessage: (value: string) => void
) {
  const [isSending, setIsSending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Extract just the first name for personalization
  const firstName = userName.split(' ')[0];

  const handleSendEmail = async () => {
    if (!friendEmail || !friendName) {
      toast({
        title: "Missing information",
        description: "Please fill in your friend's name and email.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    setShowSuccess(false);
    setErrorMessage(null);
    
    try {
      console.log("Attempting to send referral email to:", friendEmail);
      
      const result = await sendReferralEmail(
        friendEmail,
        friendName,
        firstName || userName,
        referralCode,
        emailMessage
      );
      
      console.log("Email sending result:", result);
      
      // Show success animation
      setShowSuccess(true);
      
      toast({
        title: "Invitation sent!",
        description: `Your invitation to ${friendName} was successfully delivered.`,
      });
      
      // Update sent count
      setSentCount(prev => prev + 1);
      
      // Trigger notification event
      const notificationEvent = new CustomEvent('newReferralSent', { 
        detail: { name: friendName, email: friendEmail }
      });
      window.dispatchEvent(notificationEvent);
      
      // Reset form after short delay
      setTimeout(() => {
        setFriendName("");
        setFriendEmail("");
        setEmailMessage("");
        setShowSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error sending email:", error);
      setErrorMessage("We couldn't deliver your invitation directly. It has been queued for automatic delivery.");
      
      toast({
        title: "Delivery issue",
        description: "Your invitation has been saved and will be delivered shortly.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleRetryDelivery = async () => {
    setIsProcessing(true);
    try {
      const count = await processPendingEmailsForUI();
      
      if (count > 0) {
        toast({
          title: "Success!",
          description: `Successfully delivered ${count} pending invitations.`,
        });
        setSentCount(prev => prev + count);
      } else {
        toast({
          title: "No pending invitations",
          description: "All your invitations have already been processed.",
        });
      }
    } catch (error) {
      console.error("Error processing emails:", error);
      toast({
        title: "Retry failed",
        description: "Please try again later or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isSending,
    setIsSending,
    isProcessing,
    setIsProcessing,
    sentCount,
    setSentCount,
    showSuccess,
    setShowSuccess,
    errorMessage,
    setErrorMessage,
    handleSendEmail,
    handleRetryDelivery
  };
}
