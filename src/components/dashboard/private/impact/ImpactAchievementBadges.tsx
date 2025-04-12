
import { Award } from "lucide-react";
import { motion } from "framer-motion";

interface ImpactAchievementBadgesProps {
  bottlesSaved: number;
}

export function ImpactAchievementBadges({ bottlesSaved }: ImpactAchievementBadgesProps) {
  // Define badge levels and their properties
  const badges = [
    {
      threshold: 100,
      label: "100+ Bottles",
      gradient: "from-blue-500 to-cyan-500",
      earned: bottlesSaved >= 100
    },
    {
      threshold: 500,
      label: "500+ Bottles",
      gradient: "from-green-500 to-emerald-500",
      earned: bottlesSaved >= 500
    },
    {
      threshold: 1000,
      label: "1000+ Bottles",
      gradient: "from-purple-500 to-pink-500",
      earned: bottlesSaved >= 1000
    }
  ];

  // Filter to get only earned badges
  const earnedBadges = badges.filter(badge => badge.earned);

  // If no badges earned yet, show progress towards first badge
  if (earnedBadges.length === 0) {
    const progressPercentage = Math.min(100, (bottlesSaved / 100) * 100);
    
    return (
      <div className="flex flex-col items-center mt-3">
        <p className="text-sm text-gray-400 mb-2">Progress to your first achievement</p>
        <div className="w-full max-w-xs h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm mt-1 text-gray-500">{bottlesSaved.toFixed(0)}/100 bottles saved</p>
      </div>
    );
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.5
      }
    }
  };

  const item = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm font-medium text-gray-300 mb-3"
      >
        Your Achievements
      </motion.p>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-wrap justify-center gap-3"
      >
        {earnedBadges.map((badge) => (
          <motion.div
            key={badge.threshold}
            variants={item}
            className={`flex items-center bg-gradient-to-r ${badge.gradient} px-3 py-1.5 rounded-full shadow-glow`}
          >
            <Award className="h-4 w-4 mr-1.5" />
            <span className="text-sm font-semibold">{badge.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
