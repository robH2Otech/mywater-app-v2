
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { format } from "date-fns";

// Mock data - in real app, this would come from Firebase
const mockReferrals = [
  { 
    id: "ref1", 
    date: new Date(2025, 1, 15), 
    initialName: "M.L." 
  },
  { 
    id: "ref2", 
    date: new Date(2025, 0, 28), 
    initialName: "J.D." 
  },
  { 
    id: "ref3", 
    date: new Date(2024, 11, 10), 
    initialName: "S.P." 
  }
];

interface ReferralHistoryProps {
  referrals: number;
}

export function ReferralHistory({ referrals }: ReferralHistoryProps) {
  // Use actual data or mock data limited to the number of referrals
  const historyItems = mockReferrals.slice(0, Math.min(referrals, mockReferrals.length));
  
  if (historyItems.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="p-4 rounded-lg bg-blue-950/30 border border-blue-800/20"
    >
      <h3 className="text-sm font-medium text-blue-300 mb-3">Recent Successful Referrals</h3>
      
      <div className="space-y-2">
        {historyItems.map(item => (
          <motion.div
            key={item.id}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between bg-blue-900/20 rounded-md p-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-blue-700/30 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-blue-300" />
              </div>
              <span className="text-sm text-blue-200">{item.initialName}</span>
            </div>
            <span className="text-xs text-blue-400">{format(item.date, 'MMM d, yyyy')}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
