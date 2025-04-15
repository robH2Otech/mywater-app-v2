
import { useState } from "react";
import { Copy, CheckCheck, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  
  const handleShare = async () => {
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
          <div className="text-center space-y-2">
            <h3 className="text-sm font-medium text-blue-300">Your Referral Code</h3>
            <p className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-white bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              {referralCode}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={copyReferralLink}
              variant="outline"
              className="w-full flex-1 border-blue-500/50 hover:bg-blue-700/30"
            >
              {isCopied ? (
                <>
                  <CheckCheck className="text-green-400" />
                  <span className="ml-2 text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="text-blue-300" />
                  <span className="ml-2">Copy Link</span>
                </>
              )}
            </Button>
            
            <Button
              onClick={handleShare}
              className="w-full flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Share2 className="mr-2" />
              Share Your Invite
            </Button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};
