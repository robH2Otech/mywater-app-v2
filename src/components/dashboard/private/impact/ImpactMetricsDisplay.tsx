
import { motion } from "framer-motion";
import { ImpactCard } from "./ImpactCard";
import { Waves, Recycle, Leaf, Coins } from "lucide-react";

interface ImpactMetricsDisplayProps {
  bottlesSaved: number;
  moneySaved: number;
  co2Saved: number;
  plasticSaved: number;
  bottleSize: number;
  bottleCost: number;
}

export function ImpactMetricsDisplay({
  bottlesSaved,
  moneySaved,
  co2Saved,
  plasticSaved,
  bottleSize,
  bottleCost
}: ImpactMetricsDisplayProps) {
  // Format numbers with specified decimal places
  const formatNumber = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  const formatMoney = (value: number) => `€${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;

  // Animation variants for staggered card animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-3">
      <div className="text-center text-gray-400">
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Using MYWATER instead of plastic bottles has already saved:
        </motion.p>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-0.5 text-xs text-gray-500"
        >
          Based on {bottleSize}L bottles at €{bottleCost?.toFixed(2)} each
        </motion.p>
      </div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show" 
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <motion.div variants={item}>
          <ImpactCard
            title="Bottles Saved"
            value={formatNumber(bottlesSaved)}
            icon={Waves}
            className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-600/30"
            iconColor="text-blue-400"
          />
        </motion.div>
        
        <motion.div variants={item}>
          <ImpactCard
            title="Money Saved"
            value={formatMoney(moneySaved)}
            icon={Coins}
            className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border-amber-600/30"
            iconColor="text-amber-400"
          />
        </motion.div>
        
        <motion.div variants={item}>
          <ImpactCard
            title={`${formatNumber(co2Saved)} kg`}
            value="CO₂ Reduced"
            icon={Leaf}
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-emerald-600/30"
            iconColor="text-emerald-400"
          />
        </motion.div>
        
        <motion.div variants={item}>
          <ImpactCard
            title={`${formatNumber(plasticSaved)} kg`}
            value="Plastic Saved"
            icon={Recycle}
            className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-600/30"
            iconColor="text-green-400"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
