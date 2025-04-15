
import { useState } from "react";
import { Copy, CheckCheck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ShareButtonsProps {
  referralCode: string;
  onShare: () => Promise<void>;
  onCopy: () => void;
  isCopied: boolean;
}

export function ShareButtons({ referralCode, onShare, onCopy, isCopied }: ShareButtonsProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  
  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onShare();
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Sharing failed",
        description: "Please try copying the link instead",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex flex-col sm:flex-row gap-3"
    >
      <Button
        onClick={onCopy}
        variant="outline"
        className="w-full flex-1 border-blue-500/50 hover:bg-blue-700/30 h-12 relative overflow-hidden"
      >
        <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isCopied ? 'opacity-100' : 'opacity-0'}`}>
          <CheckCheck className="text-green-400 mr-2" size={20} />
          <span className="text-green-400">Copied!</span>
        </span>
        
        <span className={`flex items-center justify-center transition-opacity duration-300 ${isCopied ? 'opacity-0' : 'opacity-100'}`}>
          <Copy className="text-blue-300 mr-2" size={18} />
          <span>Copy Link</span>
        </span>
      </Button>
      
      <Button
        onClick={handleShare}
        disabled={isSharing}
        className="w-full flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 h-12"
      >
        <Share2 className="mr-2" size={18} />
        Share Your Invite
      </Button>
    </motion.div>
  );
}
