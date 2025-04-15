
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ReferralCodeDisplay } from "./code/ReferralCodeDisplay";
import { ShareButtons } from "./code/ShareButtons";

interface ReferralCodeProps {
  referralCode?: string;
}

export function ReferralCode({ referralCode = "" }: ReferralCodeProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);
  
  const copyReferralLink = () => {
    const referralLink = `https://mywatertechnologies.com/shop?code=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };
  
  const handleShare = async () => {
    if (!referralCode) {
      toast({
        title: "No referral code found",
        description: "Please refresh the page or contact support",
        variant: "destructive"
      });
      return;
    }
    
    const shareData = {
      title: 'Get 20% Off MYWATER',
      text: `I'm loving my MYWATER purification system! Get 20% off your purchase using my referral code: ${referralCode}`,
      url: `https://mywatertechnologies.com/shop?code=${referralCode}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared!",
          description: "Thanks for sharing MYWATER with your friends",
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error sharing:", err);
          copyReferralLink(); // Fallback to copying
        }
      }
    } else {
      copyReferralLink(); // Fallback for browsers without share API
    }
  };
  
  return (
    <Card className="overflow-hidden border-2 border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-blue-700/5">
      <CardContent className="p-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <ReferralCodeDisplay referralCode={referralCode} />
          <ShareButtons 
            referralCode={referralCode}
            onShare={handleShare}
            onCopy={copyReferralLink}
            isCopied={isCopied}
          />
        </motion.div>
      </CardContent>
    </Card>
  );
}
