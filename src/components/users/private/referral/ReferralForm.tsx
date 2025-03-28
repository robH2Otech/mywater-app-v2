import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendReferralEmail } from "@/utils/emailUtil";

interface ReferralFormProps {
  userName: string;
  referralCode: string;
}

export function ReferralForm({ userName, referralCode }: ReferralFormProps) {
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  // Generate default email template when component loads or friend name changes
  const generateDefaultEmail = () => {
    const template = `Hi ${friendName || "[Friend's Name]"},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this link: https://mywater.com/refer?code=${referralCode} when you purchase.

If you decide to get a MYWATER system, you'll also get the chance to refer 3 friends and earn a free replacement cartridge for yourself!

Check it out here: https://mywater.com/products

Best,
${userName || "[Your Name]"}`;

    return template;
  };

  // Set default template when friend name changes
  const handleFriendNameChange = (value: string) => {
    setFriendName(value);
    if (emailMessage === "" || !emailMessage) {
      setEmailMessage(generateDefaultEmail());
    } else {
      // Update only the greeting line
      setEmailMessage(prev => 
        prev.replace(/^Hi.*?,/m, `Hi ${value || "[Friend's Name]"},`)
      );
    }
  };

  // Handle sending the referral email
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
    try {
      // For development/testing, log the email details
      console.log("Sending email to:", friendEmail);
      console.log("Email content:", emailMessage);
      
      // Use a direct email service for immediate delivery
      // This is a workaround since the Firebase approach wasn't delivering emails
      const emailjs = await import('emailjs-com');
      
      const templateParams = {
        to_email: friendEmail,
        to_name: friendName,
        from_name: userName,
        message: emailMessage,
        referral_code: referralCode
      };
      
      // Use Email.js as a direct service (you'll need to set up an account)
      // This is just an example and would need valid IDs in production
      await emailjs.send(
        'service_id',  // Replace with your Email.js service ID
        'template_id', // Replace with your Email.js template ID
        templateParams,
        'user_id'      // Replace with your Email.js user ID
      );
      
      // Also continue to store in Firestore for record-keeping
      const success = await sendReferralEmail(
        friendEmail,
        friendName,
        userName,
        referralCode,
        emailMessage
      );
      
      toast({
        title: "Referral sent!",
        description: `Your invitation was sent to ${friendName}.`,
        variant: "default"
      });
      
      // Add to local notifications
      const notificationEvent = new CustomEvent('newReferralSent', { 
        detail: { name: friendName, email: friendEmail }
      });
      window.dispatchEvent(notificationEvent);
      
      // Reset form fields
      setFriendName("");
      setFriendEmail("");
      setEmailMessage("");
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error sending referral",
        description: "There was a problem sending your invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Reset email message to default template
  const resetEmailTemplate = () => {
    setEmailMessage(generateDefaultEmail());
    toast({
      title: "Template reset",
      description: "The email message has been reset to the default template",
    });
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Send Referral Invitation</h3>
      
      <div className="flex flex-col md:flex-row gap-4">
        <FormInput
          label="Friend's Name"
          value={friendName}
          onChange={handleFriendNameChange}
          placeholder="John Doe"
          className="flex-1"
        />
        
        <FormInput
          label="Friend's Email"
          type="email"
          value={friendEmail}
          onChange={setFriendEmail}
          placeholder="friend@example.com"
          className="flex-1"
        />
      </div>
      
      <div>
        <label htmlFor="email-message" className="block text-sm font-medium text-gray-300 mb-1">
          Email Message
        </label>
        <Textarea
          id="email-message"
          value={emailMessage || generateDefaultEmail()}
          onChange={(e) => setEmailMessage(e.target.value)}
          rows={10}
          className="w-full"
        />
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetEmailTemplate}
            className="text-xs"
          >
            Reset to Default
          </Button>
        </div>
      </div>
      
      <Button
        onClick={handleSendEmail}
        disabled={isSending || !friendEmail || !friendName}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
      >
        {isSending ? (
          "Sending..."
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Invitation
          </>
        )}
      </Button>
    </div>
  );
}
