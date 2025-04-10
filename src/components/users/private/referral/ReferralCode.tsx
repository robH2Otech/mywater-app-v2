
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck, Facebook, Twitter, Mail, Instagram, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralCodeProps {
  referralCode: string;
}

export function ReferralCode({ referralCode }: ReferralCodeProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const copyReferralLink = () => {
    const referralLink = `https://mywatertechnologies.com/shop?code=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    
    setTimeout(() => setIsCopied(false), 3000);
  };
  
  const shareViaEmail = () => {
    const subject = "Get 20% off MYWATER water purification system";
    const body = `Hi!\n\nI thought you might be interested in MYWATER. Use my referral code ${referralCode} for 20% off!\n\nCheck it out: https://mywatertechnologies.com/shop?code=${referralCode}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };
  
  const shareViaSMS = () => {
    const message = `Hey! Try MYWATER water purification system and get 20% off with my code: ${referralCode}. https://mywatertechnologies.com/shop?code=${referralCode}`;
    // On mobile devices this should open the SMS app
    window.open(`sms:?&body=${encodeURIComponent(message)}`);
  };
  
  const shareViaFacebook = () => {
    const url = `https://mywatertechnologies.com/shop?code=${referralCode}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  };
  
  const shareViaTwitter = () => {
    const text = `Get 20% off a MYWATER water purification system using my referral code: ${referralCode}`;
    const url = `https://mywatertechnologies.com/shop?code=${referralCode}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
  };
  
  const shareViaInstagram = () => {
    // Instagram doesn't have a direct web sharing API, so we just copy the text
    const text = `Get 20% off a MYWATER water purification system using my referral code: ${referralCode}\nhttps://mywatertechnologies.com/shop?code=${referralCode}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Ready for Instagram!",
      description: "Text copied for sharing on Instagram",
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-spotify-dark rounded-lg">
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
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Share via:</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={shareViaFacebook}
            className="flex-1 min-w-[80px]"
          >
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={shareViaTwitter}
            className="flex-1 min-w-[80px]"
          >
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={shareViaInstagram}
            className="flex-1 min-w-[80px]"
          >
            <Instagram className="h-4 w-4 mr-2" />
            Instagram
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={shareViaSMS}
            className="flex-1 min-w-[80px]"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            SMS
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={shareViaEmail}
            className="flex-1 min-w-[80px]"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </div>
    </div>
  );
}
