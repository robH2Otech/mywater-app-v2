
import { Button } from "@/components/ui/button";
import { Mail, Send, FileText, Bell } from "lucide-react";
import { User } from "@/types/users";

interface UserActionButtonsProps {
  onAction: (action: 'email' | 'report' | 'reminder' | 'invoice') => void;
}

export function UserActionButtons({ onAction }: UserActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('email')}
        className="bg-spotify-accent hover:bg-spotify-accent-hover"
      >
        <Mail className="w-4 h-4 mr-2" />
        Email
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('report')}
        className="bg-spotify-accent hover:bg-spotify-accent-hover"
      >
        <FileText className="w-4 h-4 mr-2" />
        Send Report
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('reminder')}
        className="bg-spotify-accent hover:bg-spotify-accent-hover"
      >
        <Bell className="w-4 h-4 mr-2" />
        Send Reminder
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('invoice')}
        className="bg-spotify-accent hover:bg-spotify-accent-hover"
      >
        <Send className="w-4 h-4 mr-2" />
        Send Invoice
      </Button>
    </div>
  );
}
