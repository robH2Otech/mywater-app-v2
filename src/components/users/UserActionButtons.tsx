
import { Button } from "@/components/ui/button";
import { Mail, Send, FileText, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserActionButtonsProps {
  onAction: (action: 'email' | 'report' | 'reminder' | 'invoice') => void;
}

export function UserActionButtons({ onAction }: UserActionButtonsProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? 'flex-wrap justify-center' : ''} gap-2`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('email')}
        className="bg-spotify-accent hover:bg-spotify-accent-hover border-mywater-blue/20 h-9"
      >
        <Mail className="w-3.5 h-3.5 mr-1.5 text-mywater-blue" />
        Email
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('report')}
        className="bg-spotify-accent hover:bg-spotify-accent-hover border-mywater-blue/20 h-9"
      >
        <FileText className="w-3.5 h-3.5 mr-1.5 text-mywater-blue" />
        Send Report
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('reminder')}
        className="bg-spotify-accent hover:bg-spotify-accent-hover border-mywater-blue/20 h-9"
      >
        <Bell className="w-3.5 h-3.5 mr-1.5 text-mywater-blue" />
        Send Reminder
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('invoice')}
        className="bg-spotify-accent hover:bg-spotify-accent-hover border-mywater-blue/20 h-9"
      >
        <Send className="w-3.5 h-3.5 mr-1.5 text-mywater-blue" />
        Send Invoice
      </Button>
    </div>
  );
}
