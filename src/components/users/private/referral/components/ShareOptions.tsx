
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Facebook, Mail, Copy, Smartphone, MessageCircle, CheckCircle, Share
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ReferralContent {
  title: string;
  text: string;
  url: string;
}

interface ShareOptionsProps {
  referralContent: ReferralContent;
  userName: string;
  referralCode: string;
}

export function ShareOptions({ referralContent, userName, referralCode }: ShareOptionsProps) {
  const [copied, setCopied] = useState(false);
  const { title, text, url } = referralContent;
  
  // Extract first name for personalization
  const firstName = userName.split(' ')[0];
  
  // Helper function to copy content to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    
    toast({
      title: "Link copied!",
      description: "Your referral link has been copied to clipboard.",
    });
    
    setTimeout(() => setCopied(false), 3000);
  };
  
  // Share via Web Share API (mobile)
  const shareViaDevice = async () => {
    try {
      await navigator.share({ title, text, url });
      toast({
        title: "Shared successfully!",
        description: "Your invitation has been shared.",
      });
    } catch (error) {
      console.log('Error sharing:', error);
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Couldn't share",
          description: "We couldn't open your sharing options.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Share via Facebook
  const shareViaFacebook = () => {
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(fbShareUrl, '_blank', 'width=600,height=400');
    
    toast({
      title: "Facebook sharing opened",
      description: "Complete the process in the popup window.",
    });
  };
  
  // Share via Email
  const shareViaEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${text}\n\n${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Email client opened",
      description: "Complete the process in your email app.",
    });
  };
  
  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const whatsappText = encodeURIComponent(`${text}\n\n${url}`);
    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
    
    toast({
      title: "WhatsApp opened",
      description: "Complete the process in WhatsApp.",
    });
  };
  
  // Share via SMS (mainly for mobile)
  const shareViaSMS = () => {
    const smsBody = encodeURIComponent(`${text}\n\n${url}`);
    window.open(`sms:?body=${smsBody}`, '_blank');
    
    toast({
      title: "SMS app opened",
      description: "Complete the process in your messaging app.",
    });
  };

  const buttonVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.05 }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-blue-200 mb-2">Share your invitation with friends via:</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <motion.div 
          initial="initial"
          animate="animate"
          whileHover="hover"
          variants={buttonVariants}
          transition={{ delay: 0.1 }}
        >
          <Button
            onClick={shareViaDevice}
            variant="outline"
            className="w-full flex-col h-20 space-y-2 border border-blue-500/30 bg-blue-900/30 hover:bg-blue-800/50"
          >
            <Smartphone size={20} />
            <span className="text-xs">Share</span>
          </Button>
        </motion.div>
        
        <motion.div 
          initial="initial"
          animate="animate"
          whileHover="hover"
          variants={buttonVariants}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={shareViaFacebook}
            variant="outline" 
            className="w-full flex-col h-20 space-y-2 border border-blue-500/30 bg-blue-900/30 hover:bg-blue-800/50"
          >
            <Facebook size={20} />
            <span className="text-xs">Facebook</span>
          </Button>
        </motion.div>
        
        <motion.div 
          initial="initial"
          animate="animate"
          whileHover="hover"
          variants={buttonVariants}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={shareViaWhatsApp}
            variant="outline" 
            className="w-full flex-col h-20 space-y-2 border border-blue-500/30 bg-blue-900/30 hover:bg-blue-800/50"
          >
            <MessageCircle size={20} />
            <span className="text-xs">WhatsApp</span>
          </Button>
        </motion.div>
        
        <motion.div 
          initial="initial"
          animate="animate"
          whileHover="hover"
          variants={buttonVariants}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={shareViaEmail}
            variant="outline" 
            className="w-full flex-col h-20 space-y-2 border border-blue-500/30 bg-blue-900/30 hover:bg-blue-800/50"
          >
            <Mail size={20} />
            <span className="text-xs">Email</span>
          </Button>
        </motion.div>
        
        <motion.div 
          initial="initial"
          animate="animate"
          whileHover="hover"
          variants={buttonVariants}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={shareViaSMS}
            variant="outline" 
            className="w-full flex-col h-20 space-y-2 border border-blue-500/30 bg-blue-900/30 hover:bg-blue-800/50"
          >
            <Share size={20} />
            <span className="text-xs">SMS</span>
          </Button>
        </motion.div>
        
        <motion.div 
          initial="initial"
          animate="animate"
          whileHover="hover"
          variants={buttonVariants}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={() => copyToClipboard(`${text}\n\n${url}`)}
            variant="outline" 
            className="w-full flex-col h-20 space-y-2 border border-blue-500/30 bg-blue-900/30 hover:bg-blue-800/50 relative overflow-hidden"
          >
            {copied ? (
              <>
                <CheckCircle size={20} className="text-green-400" />
                <span className="text-xs text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={20} />
                <span className="text-xs">Copy Link</span>
              </>
            )}
          </Button>
        </motion.div>
      </div>
      
      {/* Message Preview */}
      <div className="mt-4 pt-4 border-t border-blue-700/30">
        <p className="text-xs text-blue-300 mb-2">Message Preview:</p>
        <div className="bg-blue-950/70 p-3 rounded border border-blue-800/30 text-xs text-blue-100">
          {text}
          <br /><br />
          <span className="text-cyan-400">{url}</span>
        </div>
      </div>
    </motion.div>
  );
}
