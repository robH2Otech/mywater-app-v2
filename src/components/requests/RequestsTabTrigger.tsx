
import { TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Clock, CheckCircle, Filter } from "lucide-react";

interface RequestsTabTriggerProps {
  value: string;
  label: string;
}

export function RequestsTabTrigger({ value, label }: RequestsTabTriggerProps) {
  const getIcon = () => {
    switch (value) {
      case "new":
        return <MessageSquare className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "all":
        return <Filter className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <TabsTrigger value={value} className="flex items-center gap-2">
      {getIcon()}
      {label}
    </TabsTrigger>
  );
}
