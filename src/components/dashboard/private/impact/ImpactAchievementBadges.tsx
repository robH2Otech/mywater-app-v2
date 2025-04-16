
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

  // If no badges earned yet, don't show anything
  if (earnedBadges.length === 0) {
    return null;
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
