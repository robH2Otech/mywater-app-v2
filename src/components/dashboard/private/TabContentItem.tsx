
import { ReactNode } from "react";
import { TabsContent } from "@/components/ui/tabs";

interface TabContentItemProps {
  value: string;
  children: ReactNode;
}

export function TabContentItem({ value, children }: TabContentItemProps) {
  return (
    <TabsContent value={value}>
      {children}
    </TabsContent>
  );
}
