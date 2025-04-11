
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Send, RefreshCw, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendReferralEmail, processPendingEmailsForUI } from "@/utils/email";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useReferralEmailForm } from "@/hooks/referral/useReferralEmailForm";
import { useReferralTracking } from "@/hooks/referral/useReferralTracking";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface ReferralFormProps {
  userName: string;
  referralCode: string;
}

export function ReferralForm({ userName, referralCode }: ReferralFormProps) {
  const { toast } = useToast();
  const { 
    friendName,
    setFriendName,
    friendEmail, 
    setFriendEmail,
    emailMessage, 
    setEmailMessage,
    generateDefaultEmail,
    handleFriendNameChange,
    resetEmailTemplate
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
          Invite a Friend
        </h3>
        {sentCount > 0 && (
          <Badge variant="secondary" className="bg-green-900/30 text-green-300 border-green-500/30">
            {sentCount} Invitation{sentCount !== 1 ? 's' : ''} Sent
          </Badge>
        )}
      </div>
      
      <Card className="border-blue-500/20 bg-blue-900/10 p-4 rounded-md">
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
  );
}
