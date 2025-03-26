
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Send, Copy, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendReferralEmail, generateReferralEmailTemplate } from "@/utils/emailUtil";
import { DocumentData } from "firebase/firestore";

interface ReferralProgramProps {
  userData: DocumentData | null;
}

export function ReferralProgram({ userData }: ReferralProgramProps) {
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const referralCode = userData?.referral_code || "MYWATER20";
  const userName = `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim();

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
      const success = await sendReferralEmail(
        friendEmail,
        friendName,
        userName,
        referralCode,
        emailMessage
      );
      
      if (success) {
        toast({
          title: "Referral sent!",
          description: `Your invitation was sent to ${friendName}.`,
          variant: "default"
        });
        // Reset form fields
        setFriendName("");
        setFriendEmail("");
        setEmailMessage("");
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      toast({
        title: "Error sending referral",
        description: "There was a problem sending your invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    const referralLink = `https://mywater.com/refer?code=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    
    setTimeout(() => setIsCopied(false), 3000);
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
    <div className="space-y-6">
      <Card className="bg-spotify-darker border-spotify-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-mywater-blue" />
            Referral Program
          </CardTitle>
          <CardDescription>
            Invite friends to try MYWATER and earn rewards when they purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Your Referral Status</p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-700 h-2.5 rounded-full">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, ((userData?.referrals_converted || 0) / 3) * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-white whitespace-nowrap">
                {userData?.referrals_converted || 0}/3
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Refer 3 friends who purchase to earn a free replacement cartridge
            </p>
          </div>

          <div className="flex items-center gap-2 mb-6 p-3 bg-spotify-dark rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-gray-400">Your Referral Code</p>
              <p className="text-lg font-mono font-bold">{referralCode}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyReferralLink}
              className="gap-2"
            >
              {isCopied ? (
                <>
                  <CheckCheck className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
