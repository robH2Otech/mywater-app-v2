
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import emailjs from 'emailjs-com';
import { EMAILJS_CONFIG, createReferralEmailParams } from "@/utils/emailUtil";

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

  // Initialize EmailJS
  const initEmailJS = () => {
    try {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      return true;
    } catch (err) {
      console.error("Error initializing EmailJS:", err);
      return false;
    }
  };

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
      
      // Initialize EmailJS
      initEmailJS();
      
      // Create email parameters using our utility function
      const templateParams = createReferralEmailParams(
        friendEmail,
        friendName,
        userName,
        referralCode,
        emailMessage
      );
      
      // Send email directly with EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      console.log("Email sending result:", response);
      
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
      setErrorMessage("We couldn't deliver your invitation directly. Please try again or use the Share Link option.");
      
      toast({
        title: "Delivery issue",
        description: "We couldn't send your invitation. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleRetryDelivery = async () => {
    setIsProcessing(true);
    try {
      // Initialize EmailJS
      initEmailJS();
      
      // Create simplified parameters for better deliverability
      const simpleParams = {
        to_email: friendEmail,
        to_name: friendName,
        from_name: userName,
        subject: `${userName.split(' ')[0]} invited you to try MYWATER with a discount!`,
        message: `I'm loving my MYWATER purification system! Get 20% off your purchase using my referral code: ${referralCode} https://mywatertechnologies.com/shop?code=${referralCode}`,
        referral_code: referralCode,
      };
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        simpleParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      toast({
        title: "Success!",
        description: `Your invitation was delivered successfully.`,
      });
      
      setSentCount(prev => prev + 1);
      setShowSuccess(true);
      setErrorMessage(null);
      
      // Reset after short delay
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error retrying email delivery:", error);
      toast({
        title: "Retry failed",
        description: "Please try sharing your link instead.",
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
