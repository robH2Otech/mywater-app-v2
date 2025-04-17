
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { SupportRequest } from "@/types/supportRequests";
import { sendEmailDirect } from "@/utils/email";
import { useToast } from "@/hooks/use-toast";

interface EmailSenderProps {
  request: SupportRequest;
  onEmailSent?: () => void;
}

export function EmailSender({ request, onEmailSent }: EmailSenderProps) {
  const [isEmailSending, setIsEmailSending] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!request.user_email) {
      toast({
        title: "Error",
        description: "No recipient email address available",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEmailSending(true);
      
      await sendEmailDirect(
        request.user_email,
        request.user_name || "Customer",
        "MYWATER Support",
        `RE: ${request.subject}`,
        `Dear ${request.user_name || "Customer"},\n\nThank you for contacting MYWATER Support. A team member will assist you shortly.\n\nBest regards,\nMYWATER Support Team`,
        request.id
      );
      
      // Call the callback if provided
      if (onEmailSent) {
        onEmailSent();
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error sending email",
        description: "Failed to send email to the user",
        variant: "destructive",
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleSendEmail}
      disabled={isEmailSending}
      className="flex gap-1 items-center bg-mywater-blue hover:bg-mywater-blue/90"
    >
      <Send className="h-4 w-4" />
      <span>{isEmailSending ? "Sending..." : "Reply by Email"}</span>
    </Button>
  );
}
