
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "./tabs";

interface EnhancedTabsProps extends React.ComponentProps<typeof Tabs> {
  items: {
    value: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}

export function EnhancedTabs({ 
  items, 
  className,
  ...props 
}: EnhancedTabsProps) {
  return (
    <Tabs
      {...props}
      className={cn("w-full", className)}
    >
      <TabsList className="grid w-full grid-cols-4 bg-gradient-to-br from-mywater-dark to-spotify-dark border border-mywater-accent/20 rounded-lg p-1">
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mywater-accent/20 data-[state=active]:to-mywater-secondary/20 data-[state=active]:shadow-lg transition-all duration-300"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              {item.icon}
              <span>{item.label}</span>
            </motion.div>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
