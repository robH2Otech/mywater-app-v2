
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Send, RefreshCw, Check, AlertCircle, Share2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useReferralEmailForm } from "@/hooks/referral/useReferralEmailForm";
import { useReferralTracking } from "@/hooks/referral/useReferralTracking";

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
    setIsSending,
    isProcessing,
    setIsProcessing,
    sentCount,
    setSentCount,
    showSuccess,
    setShowSuccess,
    errorMessage,
    setErrorMessage,
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
          setSentCount(prev => prev + 1);
        })
        .catch((error) => {
          console.log('Error sharing:', error);
          // Fallback to copying to clipboard if sharing failed
          navigator.clipboard.writeText(`${shareText}\n\n${referralLink}`);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(`${shareText}\n\n${referralLink}`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
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
          {showSuccess ? 'Link Copied!' : 'Share Your Link'}
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <FormInput
                      label="Friend's Name"
                      value={friendName}
                      onChange={handleFriendNameChange}
                      placeholder="John Doe"
                      className="bg-blue-950/40 border-blue-700/30"
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FormInput
                      label="Friend's Email"
                      type="email"
                      value={friendEmail}
                      onChange={setFriendEmail}
                      placeholder="friend@example.com"
                      className="bg-blue-950/40 border-blue-700/30"
                    />
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="email-message" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Invitation Message
                  </label>
                  <Textarea
                    id="email-message"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={6}
                    className="w-full bg-blue-950/40 border-blue-700/30"
                    placeholder="Write a personal message to invite your friend..."
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetEmailTemplate}
                      className="text-xs border-blue-700/30 hover:bg-blue-800/30"
                    >
                      Reset to Default
                    </Button>
                  </div>
                </motion.div>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert variant="destructive" className="bg-yellow-900/20 border-yellow-600/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Delivery Status</AlertTitle>
                      <AlertDescription>
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3 mt-2"
                >
                  <Button
                    onClick={() => handleSendEmail()}
                    disabled={isSending || !friendEmail || !friendName}
                    className={`w-full sm:w-3/4 transition-all duration-300 ${
                      showSuccess 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    }`}
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : showSuccess ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Invitation Sent!
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => handleRetryDelivery()}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full sm:w-1/4 border-blue-700/30 hover:bg-blue-800/30"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? "animate-spin" : ""}`} />
                        Retry Delivery
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
