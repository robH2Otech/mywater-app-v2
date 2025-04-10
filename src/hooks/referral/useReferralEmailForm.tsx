
import { useState, useEffect } from "react";

export function useReferralEmailForm(userName: string, referralCode: string) {
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  
  // Extract just the first name for personalization
  const firstName = userName.split(' ')[0];
  
  const generateDefaultEmail = () => {
    return `Hi ${friendName || "[Friend's Name]"},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this code: ${referralCode} when you purchase.

Check it out here: https://mywater.com/products

Best,
${firstName || "[Your Name]"}`;
  };

  const handleFriendNameChange = (value: string) => {
    setFriendName(value);
    
    // Update the email template with the new friend name
    const updatedTemplate = emailMessage.replace(
      /^Hi.*?,/m, 
      `Hi ${value || "[Friend's Name]"},`
    );
    setEmailMessage(updatedTemplate);
  };

  const resetEmailTemplate = () => {
    setEmailMessage(generateDefaultEmail());
    return true;
  };
  
  useEffect(() => {
    // If the template is empty, generate a default
    if (!emailMessage) {
      setEmailMessage(generateDefaultEmail());
    }
  }, []);
  
  return {
    friendName,
    setFriendName,
    friendEmail,
    setFriendEmail,
    emailMessage,
    setEmailMessage,
    generateDefaultEmail,
    handleFriendNameChange,
    resetEmailTemplate
  };
}
