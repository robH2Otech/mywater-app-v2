
import { Card, CardContent } from "@/components/ui/card";
import { Filter, Calendar, Droplets, Share2 } from "lucide-react";
import { DocumentData } from "firebase/firestore";
import { motion } from "framer-motion";

interface HomeStatsProps {
  userData: DocumentData | null;
  daysUntilReplacement: number | null;
  isReplacementOverdue: boolean;
  isReplacementDueSoon: boolean;
}

export function HomeStats({ 
  userData, 
  daysUntilReplacement, 
  isReplacementOverdue,
  isReplacementDueSoon,
}: HomeStatsProps) {
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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 h-full"
    >
      {/* Cartridge Status Card */}
      <motion.div variants={item}>
        <Card className="glass overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-blue-900/60 flex items-center justify-center border border-blue-500/20">
              <Filter className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Cartridge Status</p>
              <p className={`text-sm font-medium ${
                isReplacementOverdue 
                  ? "text-red-400" 
                  : isReplacementDueSoon 
                    ? "text-amber-400" 
                    : "text-green-400"
              }`}>
                {isReplacementOverdue 
                  ? `Overdue by ${Math.abs(daysUntilReplacement!)} days` 
                  : `Replacement in ${daysUntilReplacement} days`}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Purchase Date Card */}
      <motion.div variants={item}>
        <Card className="glass overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-purple-900/60 flex items-center justify-center border border-purple-500/20">
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Purchased On</p>
              <p className="text-sm font-medium">
                {userData?.purchase_date 
                  ? new Date(userData.purchase_date).toLocaleDateString() 
                  : "Not available"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Model Card */}
      <motion.div variants={item}>
        <Card className="glass overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-blue-900/60 flex items-center justify-center border border-blue-500/20">
              <Droplets className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Purifier Model</p>
              <p className="text-sm font-medium">{userData?.purifier_model || "Standard"}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referral Card */}
      <motion.div variants={item}>
        <Card className="glass overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-green-900/60 flex items-center justify-center border border-green-500/20">
              <Share2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Referral Program</p>
              <p className="text-sm font-medium">
                <span className="text-green-400 font-semibold">{userData?.referrals_converted || 0}</span>/3 Referrals
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
