
import { LucideIcon } from "lucide-react";
import { TabsTrigger } from "@/components/ui/tabs";

interface TabTriggerItemProps {
  value: string;
  label: string;
  icon: LucideIcon;
}

export function TabTriggerItem({ value, label, icon: Icon }: TabTriggerItemProps) {
  return (
    <TabsTrigger value={value} className="flex gap-1">
      <Icon className="h-4 w-4" />
      {label}
    </TabsTrigger>
  );
}
