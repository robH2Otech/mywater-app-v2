
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ReferralCodeDisplay } from "./code/ReferralCodeDisplay";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HowItWorks } from "./components/HowItWorks";

interface ReferralCodeProps {
  referralCode: string;
}

export function ReferralCode({ referralCode }: ReferralCodeProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { toast } = useToast();
  
  // Debug log to check the referral code
  console.log("ReferralCode component - received code:", referralCode);
  
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
  
  return (
    <Card className="overflow-hidden border-2 border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-blue-700/5">
      <CardContent className="p-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <ReferralCodeDisplay referralCode={referralCode} />
          
          <div className="flex space-x-4">
            <button 
              onClick={copyReferralLink} 
              className="flex-grow bg-black/50 px-4 py-2 rounded text-sm text-white hover:bg-black/70 transition-colors"
            >
              Copy Link
            </button>
          </div>
          
          <Collapsible
            open={isGuideOpen}
            onOpenChange={setIsGuideOpen}
            className="mt-6 border-t border-blue-800/30 pt-4"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm text-blue-300 hover:text-blue-100">
              <span className="font-medium">How It Works</span>
              {isGuideOpen ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <HowItWorks />
            </CollapsibleContent>
          </Collapsible>
        </motion.div>
      </CardContent>
    </Card>
  );
}
