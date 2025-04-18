
import { motion } from "framer-motion";

export function ReferralTitle() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-center"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mt-3 bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
        Refer Friends & Earn Rewards
      </h2>
      <div className="flex flex-col items-center gap-2 mt-3">
        <p className="text-green-300 font-semibold text-lg">
          You Earn: Free €150 Cartridge!
        </p>
        <p className="text-blue-300">
          Your Friends Get: 10% Off Their Purchase
        </p>
      </div>
    </motion.div>
  );
}
