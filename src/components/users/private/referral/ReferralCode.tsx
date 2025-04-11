
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck, Facebook, Twitter, Mail, Instagram, MessageSquare, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
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
  
  const shareViaEmail = () => {
    const subject = "Get 20% off MYWATER water purification system";
    const body = `Hi!\n\nI thought you might be interested in MYWATER. Use my referral code ${referralCode} for 20% off!\n\nCheck it out: https://mywatertechnologies.com/shop?code=${referralCode}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };
  
  const shareViaSMS = () => {
    const message = `Hey! Try MYWATER water purification system and get 20% off with my code: ${referralCode}. https://mywatertechnologies.com/shop?code=${referralCode}`;
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
    const text = `Get 20% off a MYWATER water purification system using my referral code: ${referralCode}\nhttps://mywatertechnologies.com/shop?code=${referralCode}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Ready for Instagram!",
      description: "Text copied for sharing on Instagram",
    });
  };
  
  return (
    <Card className="overflow-hidden border-2 border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-blue-700/5">
      <CardContent className="p-4 space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-blue-900/30 rounded-lg"
        >
          <div className="flex-1">
            <p className="text-sm text-blue-300 mb-1">Your Unique Referral Code</p>
            <p className="text-xl font-mono font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{referralCode}</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={copyReferralLink}
              className="gap-2 border-blue-500/50 hover:bg-blue-700/30"
            >
              {isCopied ? (
                <>
                  <CheckCheck className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-blue-300" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
        
        <div className="space-y-3">
          <p className="text-sm font-medium text-blue-200 flex items-center">
            <Share2 className="h-4 w-4 mr-2" />
            Share your code via:
          </p>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          >
            <ShareButton icon={Facebook} label="Facebook" onClick={shareViaFacebook} color="bg-blue-600" />
            <ShareButton icon={Twitter} label="Twitter" onClick={shareViaTwitter} color="bg-sky-500" />
            <ShareButton icon={Instagram} label="Instagram" onClick={shareViaInstagram} color="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
            <ShareButton icon={MessageSquare} label="SMS" onClick={shareViaSMS} color="bg-green-600" />
            <ShareButton icon={Mail} label="Email" onClick={shareViaEmail} color="bg-amber-600" className="sm:col-span-2 lg:col-span-1" />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ShareButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color: string;
  className?: string;
}

function ShareButton({ icon: Icon, label, onClick, color, className = "" }: ShareButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-white ${color} hover:opacity-90 shadow-sm transition-all ${className}`}
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}
