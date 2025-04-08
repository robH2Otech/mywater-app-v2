
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Send, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendReferralEmail, processPendingEmailsForUI } from "@/utils/email";

interface ReferralFormProps {
  userName: string;
  referralCode: string;
}

export function ReferralForm({ userName, referralCode }: ReferralFormProps) {
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();
  
  // Extract just the first name for personalization
  const firstName = userName.split(' ')[0];
  
  const generateDefaultEmail = () => {
    const template = `Hi ${friendName || "[Friend's Name]"},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this link: https://mywater.com/refer?code=${referralCode} when you purchase.

If you decide to get a MYWATER system, you'll also get the chance to refer 3 friends and earn a free replacement cartridge for yourself!

Check it out here: https://mywater.com/products

Best,
${firstName || "[Your Name]"}`;

    return template;
  };

  const handleFriendNameChange = (value: string) => {
    setFriendName(value);
    if (emailMessage === "" || !emailMessage) {
      setEmailMessage(generateDefaultEmail());
    } else {
      setEmailMessage(prev => 
        prev.replace(/^Hi.*?,/m, `Hi ${value || "[Friend's Name]"},`)
      );
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
    try {
      console.log("Sending referral email to:", friendEmail);
      
      await sendReferralEmail(
        friendEmail,
        friendName,
        firstName,
        referralCode,
        emailMessage
      );
      
      toast({
        title: "Referral sent!",
        description: `Your invitation was sent to ${friendName}.`,
      });
      
      // Trigger notification event
      const notificationEvent = new CustomEvent('newReferralSent', { 
        detail: { name: friendName, email: friendEmail }
      });
      window.dispatchEvent(notificationEvent);
      
      // Reset form
      setFriendName("");
      setFriendEmail("");
      setEmailMessage("");
      
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error sending referral",
        description: "There was a problem sending your invitation. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const resetEmailTemplate = () => {
    setEmailMessage(generateDefaultEmail());
    toast({
      title: "Template reset",
      description: "The email message has been reset to the default template",
    });
  };
  
  const handleProcessPendingEmails = async () => {
    setIsProcessing(true);
    try {
      const count = await processPendingEmailsForUI();
      
      if (count > 0) {
        toast({
          title: "Processing complete",
          description: `Processed ${count} pending emails.`,
        });
      } else {
        toast({
          title: "No pending emails",
          description: "There are no recent pending emails to process.",
        });
      }
    } catch (error) {
      console.error("Error processing emails:", error);
      toast({
        title: "Processing error",
        description: "There was a problem processing pending emails.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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
      
      <div className="flex flex-col md:flex-row gap-2">
        <Button
          onClick={handleSendEmail}
          disabled={isSending || !friendEmail || !friendName}
          className="w-full md:w-3/4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
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
        
        <Button
          onClick={handleProcessPendingEmails}
          disabled={isProcessing}
          variant="outline"
          className="w-full md:w-1/4"
        >
          {isProcessing ? (
            "Processing..."
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Process Pending
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
