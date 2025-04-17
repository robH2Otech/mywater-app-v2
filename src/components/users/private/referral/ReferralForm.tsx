
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useReferralEmailForm } from "@/hooks/referral/useReferralEmailForm";
import { useReferralTracking } from "@/hooks/referral/useReferralTracking";
import { EmailForm } from "./components/EmailForm";
import { toast } from "@/hooks/use-toast";

interface ReferralFormProps {
  userName: string;
  referralCode: string;
}

export function ReferralForm({ userName, referralCode }: ReferralFormProps) {
  const [isEmailFormVisible, setIsEmailFormVisible] = useState(false);

  const { 
    friendName,
    setFriendName,
    friendEmail, 
    setFriendEmail,
    emailMessage, 
    setEmailMessage,
    resetEmailTemplate,
    handleFriendNameChange,
  } = useReferralEmailForm(userName, referralCode);
  
  const {
    isSending,
    isProcessing,
    sentCount,
    showSuccess,
    errorMessage,
    handleSendEmail,
    handleRetryDelivery
  } = useReferralTracking(
    friendName, 
    friendEmail, 
    userName, 
    referralCode, 
    emailMessage,
    setFriendName,
    setFriendEmail,
    setEmailMessage
  );

  const toggleEmailForm = () => {
    setIsEmailFormVisible(!isEmailFormVisible);
  };

  const handleShareLink = () => {
    const referralLink = `https://mywatertechnologies.com/shop?code=${referralCode}`;
    const shareText = `I'm loving my MYWATER water purification system and thought you might like it too! Get 20% off with my referral code: ${referralCode}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'MYWATER - Get 20% Off!',
        text: shareText,
        url: referralLink,
      })
        .then(() => {
          console.log('Successfully shared');
          toast({
            title: "Link shared successfully!",
            description: "Your referral link has been shared.",
          });
        })
        .catch((error) => {
          console.log('Error sharing:', error);
          // Fallback to copying to clipboard if sharing failed
          navigator.clipboard.writeText(`${shareText}\n\n${referralLink}`);
          toast({
            title: "Link copied to clipboard!",
            description: "Your referral link has been copied to clipboard.",
          });
        });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(`${shareText}\n\n${referralLink}`);
      toast({
        title: "Link copied to clipboard!",
        description: "Your referral link has been copied to clipboard.",
      });
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
          Share With Friends
        </h3>
      </div>
      
      {/* Primary Sharing Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={handleShareLink}
          className="w-full h-12 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all"
        >
          <Share2 className="h-5 w-5 mr-2" />
          Share Your Link
        </Button>
        
        <Button
          onClick={toggleEmailForm}
          className={`w-full h-12 transition-all ${
            isEmailFormVisible 
              ? "bg-blue-700 hover:bg-blue-800" 
              : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          }`}
        >
          <Send className="h-5 w-5 mr-2" />
          {isEmailFormVisible ? 'Hide Email Form' : 'Invite via Email'}
        </Button>
      </div>
      
      <AnimatePresence>
        {isEmailFormVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="border-blue-500/20 bg-blue-900/10 p-4 rounded-md mt-3">
              <EmailForm
                friendName={friendName}
                friendEmail={friendEmail}
                emailMessage={emailMessage}
                isSending={isSending}
                isProcessing={isProcessing}
                showSuccess={showSuccess}
                errorMessage={errorMessage}
                onFriendNameChange={handleFriendNameChange}
                onFriendEmailChange={setFriendEmail}
                onEmailMessageChange={(e) => setEmailMessage(e.target.value)}
                onResetTemplate={resetEmailTemplate}
                onSendEmail={handleSendEmail}
                onRetryDelivery={handleRetryDelivery}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
