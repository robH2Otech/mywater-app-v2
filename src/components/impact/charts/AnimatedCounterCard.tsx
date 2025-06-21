
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedCounterCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  iconColor?: string;
  increment?: number;
  duration?: number;
  prefix?: string;
}

export function AnimatedCounterCard({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = "text-blue-400",
  increment = 1,
  duration = 2000,
  prefix = ""
}: AnimatedCounterCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [value, duration]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-spotify-darker via-slate-900/50 to-spotify-darker border-spotify-accent/30 hover:border-spotify-accent/50 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            {title}
          </CardTitle>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-white">
              {prefix}{displayValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">
              {unit}
            </div>
          </div>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: displayValue / value }}
            transition={{ duration: duration / 1000, ease: "easeOut" }}
            className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full origin-left"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
