
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Send, RefreshCw, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendReferralEmail, processPendingEmailsForUI } from "@/utils/email";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
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

  const resetEmailTemplate = () => {
    setEmailMessage(generateDefaultEmail());
    toast({
      title: "Template reset",
      description: "The email message has been reset to the default template",
    });
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
          <Badge variant="secondary" className="bg-green-900/30 text-green-300 border-green-500/30">
            {sentCount} Invitation{sentCount !== 1 ? 's' : ''} Sent
          </Badge>
        )}
      </div>
      
      <Alert className="bg-blue-900/20 border-blue-500/30 text-blue-100">
        <AlertTitle className="flex items-center gap-2">
          <Check className="h-4 w-4" /> Direct Email Delivery
        </AlertTitle>
        <AlertDescription className="text-blue-200">
          Your referral invitations are delivered directly to recipients when you send them.
          Check delivery status in the referral dashboard.
        </AlertDescription>
      </Alert>
      
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
          value={emailMessage}
          onChange={(e) => setEmailMessage(e.target.value)}
          rows={6}
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

      {errorMessage && (
        <Alert variant="destructive" className="bg-yellow-900/20 border-yellow-600/30">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Delivery Status</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleSendEmail}
          disabled={isSending || !friendEmail || !friendName}
          className={`w-full sm:w-3/4 transition-all duration-300 ${
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
          onClick={handleRetryDelivery}
          disabled={isProcessing}
          variant="outline"
          className="w-full sm:w-1/4"
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
