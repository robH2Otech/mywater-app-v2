
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Achievement {
  title: string;
  progress: number;
  target: number;
  unlocked: boolean;
  icon: string;
}

interface RadialProgressChartProps {
  achievements: Achievement[];
}

export function RadialProgressChart({ achievements }: RadialProgressChartProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Environmental Achievements</CardTitle>
        <CardDescription className="text-gray-400">
          Progress towards environmental milestones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {achievements.map((achievement, index) => {
            const progressPercent = (achievement.progress / achievement.target) * 100;
            const strokeDasharray = `${(progressPercent / 100) * circumference} ${circumference}`;
            
            return (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-3">
                  <svg width="100" height="100" className="transform -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#374151"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke={achievement.unlocked ? "#10b981" : "#3b82f6"}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={strokeDasharray}
                      strokeLinecap="round"
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      animate={{ strokeDasharray }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">{achievement.icon}</span>
                  </div>
                </div>
                <h4 className="text-sm font-medium text-white mb-1">
                  {achievement.title}
                </h4>
                <p className="text-xs text-gray-400 mb-2">
                  {achievement.progress.toLocaleString()} / {achievement.target.toLocaleString()}
                </p>
                <div className="text-xs font-medium">
                  <span className={achievement.unlocked ? "text-green-400" : "text-blue-400"}>
                    {Math.round(progressPercent)}% Complete
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
