
import { AlertTriangle, Calendar, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface CartridgeAlertProps {
  isReplacementDueSoon: boolean;
  isReplacementOverdue: boolean;
  formattedReplacementDate: string | null;
}

export function CartridgeAlert({ 
  isReplacementDueSoon,
  isReplacementOverdue,
  formattedReplacementDate 
}: CartridgeAlertProps) {
  if (!isReplacementDueSoon && !isReplacementOverdue) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-green-900/40 to-emerald-900/30 rounded-lg border border-green-500/20 p-4 shadow-lg"
      >
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
          <div>
            <p className="text-sm text-green-300">
              Your cartridge is working perfectly!
            </p>
            {formattedReplacementDate && (
              <p className="text-xs text-green-400/70 flex items-center mt-0.5">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Next replacement scheduled for {formattedReplacementDate}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-4 shadow-lg ${
        isReplacementOverdue
          ? "bg-gradient-to-r from-red-900/40 to-red-800/30 border-red-500/30"
          : "bg-gradient-to-r from-amber-900/40 to-orange-800/30 border-amber-500/30"
      }`}
    >
      <div className="flex items-center">
        <AlertTriangle className={`h-5 w-5 mr-2 ${
          isReplacementOverdue ? "text-red-400" : "text-amber-400"
        }`} />
        <div>
          <p className={`text-sm ${
            isReplacementOverdue ? "text-red-300" : "text-amber-300"
          }`}>
            {isReplacementOverdue
              ? "Your cartridge replacement is overdue!"
              : "Your cartridge will need replacement soon."
            }
          </p>
          {formattedReplacementDate && (
            <p className={`text-xs flex items-center mt-0.5 ${
              isReplacementOverdue ? "text-red-400/70" : "text-amber-400/70"
            }`}>
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {isReplacementOverdue
                ? `Was due for replacement on ${formattedReplacementDate}`
                : `Scheduled for replacement on ${formattedReplacementDate}`
              }
            </p>
          )}
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-3"
      >
        <a 
          href="/private-dashboard/shop" 
          className={`text-xs py-1.5 px-3 rounded-md inline-flex items-center ${
            isReplacementOverdue
              ? "bg-red-500/20 hover:bg-red-500/30 text-white"
              : "bg-amber-500/20 hover:bg-amber-500/30 text-white"
          } transition-colors duration-200`}
        >
          Order replacement cartridge
          <svg className="ml-1 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </motion.div>
    </motion.div>
  );
}
