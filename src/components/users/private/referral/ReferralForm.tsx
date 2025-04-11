
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Send, RefreshCw, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useReferralEmailForm } from "@/hooks/referral/useReferralEmailForm";
import { useReferralTracking } from "@/hooks/referral/useReferralTracking";
import { motion } from "framer-motion";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-spotify-dark/60 rounded-xl p-5 space-y-4"
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-semibold flex items-center">
          <Send className="h-5 w-5 mr-2 text-green-400" />
          Send Invitation
        </h3>
        {sentCount > 0 && (
          <Badge variant="secondary" className="bg-green-900/30 text-green-300 border-green-500/30">
            {sentCount} Invitation{sentCount !== 1 ? 's' : ''} Sent
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Friend's Name"
          value={friendName}
          onChange={handleFriendNameChange}
          placeholder="John Doe"
          className="bg-spotify-accent/10"
        />
        
        <FormInput
          label="Friend's Email"
          type="email"
          value={friendEmail}
          onChange={setFriendEmail}
          placeholder="friend@example.com"
          className="bg-spotify-accent/10"
        />
      </div>
      
      <div>
        <label htmlFor="email-message" className="block text-sm font-medium text-gray-300 mb-1">
          Email Message
        </label>
        <Textarea
          id="email-message"
          value={emailMessage}
          onChange={(e) => setEmailMessage(e.target.value)}
          rows={6}
          className="w-full bg-spotify-accent/10 resize-none"
        />
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetEmailTemplate}
            className="text-xs"
          >
            Reset Message
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="bg-yellow-900/20 border-yellow-600/30">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Delivery Status</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
          className="w-full sm:w-1/4"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? "animate-spin" : ""}`} />
              Retry Delivery
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
