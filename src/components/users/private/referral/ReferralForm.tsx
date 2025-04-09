
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Send, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendReferralEmail, processPendingEmailsForUI } from "@/utils/email";
import { Badge } from "@/components/ui/badge";

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
  const [sentCount, setSentCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendingError, setSendingError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Extract just the first name for personalization
  const firstName = userName.split(' ')[0];
  
  const generateDefaultEmail = () => {
    const template = `Hi ${friendName || "[Friend's Name]"},

I wanted to share something I've been really happy with – my MYWATER water purification system. It provides clean, great-tasting water right from my tap, and I'm saving money on bottled water.

I'm inviting you to try MYWATER with a special 20% discount! Just use this code: ${referralCode} when you purchase.

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
    setShowSuccess(false);
    setSendingError(null);
    
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
      
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Update sent count
      setSentCount(prev => prev + 1);
      
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
      setSendingError("Email delivery encountered an issue. It has been queued for automatic delivery.");
      toast({
        title: "Email delivery issue",
        description: "Your invitation has been queued and will be delivered automatically.",
        variant: "default"
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
    setSendingError(null);
    try {
      const count = await processPendingEmailsForUI();
      
      if (count > 0) {
        toast({
          title: "Delivery attempted",
          description: `Processed ${count} pending invitations.`,
        });
        setSentCount(prev => prev + count);
      } else {
        toast({
          title: "No pending invitations",
          description: "All your invitations have been processed.",
        });
      }
    } catch (error) {
      console.error("Error processing emails:", error);
      toast({
        title: "Delivery retry",
        description: "Your invitations are being processed again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    // If the template is empty, generate a default
    if (!emailMessage) {
      setEmailMessage(generateDefaultEmail());
    }
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Send Referral Invitation</h3>
        {sentCount > 0 && (
          <Badge variant="outline" className="bg-green-900/30 text-green-300">
            {sentCount} Invitation{sentCount !== 1 ? 's' : ''} Sent
          </Badge>
        )}
      </div>
      
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
          rows={8}
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

      {sendingError && (
        <div className="flex items-start gap-2 p-3 border rounded-md border-yellow-500/30 bg-yellow-900/10">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-200">
            {sendingError}
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-2">
        <Button
          onClick={handleSendEmail}
          disabled={isSending || !friendEmail || !friendName}
          className={`w-full md:w-3/4 transition-all duration-300 ${
            showSuccess 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          }`}
        >
          {isSending ? (
            "Sending..."
          ) : showSuccess ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Invitation Sent!
            </>
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
              <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? "animate-spin" : ""}`} />
              Retry Delivery
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
