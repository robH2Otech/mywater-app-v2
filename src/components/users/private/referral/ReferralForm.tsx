
import { useState, useEffect } from "react";
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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Send Referral Invitation</h3>
        {sentCount > 0 && (
          <Badge variant="secondary" className="bg-green-900/30 text-green-300 border-green-500/30">
            {sentCount} Invitation{sentCount !== 1 ? 's' : ''} Sent
          </Badge>
        )}
      </div>
      
      <Alert className="bg-blue-900/20 border-blue-500/30 text-blue-100">
        <AlertTitle className="flex items-center gap-2">
          <Check className="h-4 w-4" /> Direct Email Delivery
        </AlertTitle>
        <AlertDescription className="text-blue-200">
          Your referral invitations are delivered directly to recipients when you send them.
          Check delivery status in the referral dashboard.
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col md:flex-row gap-4">
        <FormInput
          label="Friend's Name"
          value={friendName}
          onChange={handleFriendNameChange}
          placeholder="John Doe"
          className="flex-1"
        />
        
        <FormInput
          label="Friend's Email"
          type="email"
          value={friendEmail}
          onChange={setFriendEmail}
          placeholder="friend@example.com"
          className="flex-1"
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
          className="w-full"
        />
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetEmailTemplate}
            className="text-xs"
          >
            Reset to Default
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
      
      <div className="flex flex-col sm:flex-row gap-2">
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
            "Sending..."
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
            "Processing..."
          ) : (
            <>
              <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? "animate-spin" : ""}`} />
              Retry Delivery
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
