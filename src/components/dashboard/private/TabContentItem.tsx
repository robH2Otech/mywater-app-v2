
import { motion } from "framer-motion";
import { TabsContent } from "@/components/ui/tabs";

interface TabContentItemProps {
  value: string;
  children: React.ReactNode;
}

export function TabContentItem({ value, children }: TabContentItemProps) {
  return (
    <TabsContent 
      value={value} 
      className="mt-6 focus-visible:outline-none focus-visible:ring-0"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </TabsContent>
  );
}
