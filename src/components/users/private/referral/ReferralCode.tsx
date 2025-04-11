
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck, Facebook, Twitter, Mail, Instagram, MessageSquare, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ReferralCodeProps {
  referralCode: string;
}

export function ReferralCode({ referralCode }: ReferralCodeProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div className="space-y-4 bg-spotify-dark/60 rounded-xl p-5">
      <h3 className="text-lg font-semibold flex items-center">
        <Share2 className="h-5 w-5 mr-2 text-blue-400" />
        Your Referral Code
      </h3>
      
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-lg border border-blue-500/20"
      >
        <div className="flex-1">
          <p className="text-xs text-gray-300 mb-1">Share this code</p>
          <p className="text-2xl font-mono font-bold tracking-wider text-white">{referralCode}</p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={copyReferralLink}
          className={`gap-2 transition-all ${isCopied ? "bg-green-600 hover:bg-green-700" : ""}`}
        >
          {isCopied ? (
            <>
              <CheckCheck className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </motion.div>
      
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="flex items-center">
            <Share2 className="h-4 w-4 mr-2" />
            Share via
          </span>
          <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
            ▼
          </span>
        </Button>
        
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaFacebook}
              className="bg-blue-900/20 border-blue-500/20 hover:bg-blue-800/40"
            >
              <Facebook className="h-4 w-4 mr-2 text-blue-400" />
              Facebook
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaTwitter}
              className="bg-blue-900/20 border-cyan-500/20 hover:bg-blue-800/40"
            >
              <Twitter className="h-4 w-4 mr-2 text-cyan-400" />
              Twitter
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaInstagram}
              className="bg-purple-900/20 border-pink-500/20 hover:bg-purple-800/40"
            >
              <Instagram className="h-4 w-4 mr-2 text-pink-400" />
              Instagram
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaSMS}
              className="bg-green-900/20 border-green-500/20 hover:bg-green-800/40"
            >
              <MessageSquare className="h-4 w-4 mr-2 text-green-400" />
              SMS
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaEmail}
              className="bg-amber-900/20 border-amber-500/20 hover:bg-amber-800/40"
            >
              <Mail className="h-4 w-4 mr-2 text-amber-400" />
              Email
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={copyReferralLink}
              className="bg-gray-800 border-gray-600 hover:bg-gray-700"
            >
              <Copy className="h-4 w-4 mr-2 text-gray-400" />
              Copy Link
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
