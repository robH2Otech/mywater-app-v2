
import { Waves, Coins, Leaf, Recycle } from "lucide-react";
import { motion } from "framer-motion";

interface ImpactMetricsProps {
  bottlesSaved: number;
  moneySaved: number;
  co2Saved: number;
  plasticSaved: number;
}

export function ImpactMetrics({ 
  bottlesSaved, 
  moneySaved, 
  co2Saved, 
  plasticSaved 
}: ImpactMetricsProps) {
  // Format numbers with specified decimal places
  const formatNumber = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  const formatMoney = (value: number) => `€${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <motion.div variants={item} className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 text-center">
        <Waves className="h-6 w-6 mx-auto text-blue-400 mb-2" />
        <div className="text-xl font-bold">{formatNumber(bottlesSaved)}</div>
        <div className="text-sm text-gray-400">Bottles Saved</div>
      </motion.div>

      <motion.div variants={item} className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-4 text-center">
        <Coins className="h-6 w-6 mx-auto text-amber-400 mb-2" />
        <div className="text-xl font-bold">{formatMoney(moneySaved)}</div>
        <div className="text-sm text-gray-400">Money Saved</div>
      </motion.div>

      <motion.div variants={item} className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-4 text-center">
        <Leaf className="h-6 w-6 mx-auto text-emerald-400 mb-2" />
        <div className="text-xl font-bold">{formatNumber(co2Saved)} kg</div>
        <div className="text-sm text-gray-400">CO₂ Reduced</div>
      </motion.div>

      <motion.div variants={item} className="bg-green-900/20 border border-green-500/20 rounded-lg p-4 text-center">
        <Recycle className="h-6 w-6 mx-auto text-green-400 mb-2" />
        <div className="text-xl font-bold">{formatNumber(plasticSaved)} kg</div>
        <div className="text-sm text-gray-400">Plastic Saved</div>
      </motion.div>
    </motion.div>
  );
}
