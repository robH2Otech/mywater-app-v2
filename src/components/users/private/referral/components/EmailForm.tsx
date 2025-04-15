
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Send, Check } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EmailFormProps {
  friendName: string;
  friendEmail: string;
  emailMessage: string;
  isSending: boolean;
  isProcessing: boolean;
  showSuccess: boolean;
  errorMessage: string | null;
  onFriendNameChange: (value: string) => void;
  onFriendEmailChange: (value: string) => void;
  onEmailMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onResetTemplate: () => void;
  onSendEmail: () => void;
  onRetryDelivery: () => void;
}

export function EmailForm({
  friendName,
  friendEmail,
  emailMessage,
  isSending,
  isProcessing,
  showSuccess,
  errorMessage,
  onFriendNameChange,
  onFriendEmailChange,
  onEmailMessageChange,
  onResetTemplate,
  onSendEmail,
  onRetryDelivery
}: EmailFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <FormInput
            label="Friend's Name"
            value={friendName}
            onChange={onFriendNameChange}
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
            onChange={onFriendEmailChange}
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
          onChange={onEmailMessageChange}
          rows={6}
          className="w-full bg-blue-950/40 border-blue-700/30"
          placeholder="Write a personal message to invite your friend..."
        />
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onResetTemplate}
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
          onClick={onSendEmail}
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
          onClick={onRetryDelivery}
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
              <RefreshCw className={`h-4 w-4 mr-2`} />
              Retry Delivery
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
