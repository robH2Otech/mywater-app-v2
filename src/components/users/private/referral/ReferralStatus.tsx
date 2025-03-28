
import { DocumentData } from "firebase/firestore";
import { Award } from "lucide-react";

interface ReferralStatusProps {
  userData: DocumentData | null;
}

export function ReferralStatus({ userData }: ReferralStatusProps) {
  const isMyWaterHero = (userData?.referrals_converted || 0) >= 3;
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400 mb-2">Your Referral Status</p>
        {isMyWaterHero && (
          <div className="flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs rounded-full px-2 py-1">
            <Award className="h-3 w-3" />
            <span>MYWATER HERO</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-full bg-gray-700 h-2.5 rounded-full">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2.5 rounded-full" 
            style={{ width: `${Math.min(100, ((userData?.referrals_converted || 0) / 3) * 100)}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium text-white whitespace-nowrap">
          {userData?.referrals_converted || 0}/3
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {isMyWaterHero 
          ? "Congratulations! You've earned a free replacement cartridge!" 
          : "Refer 3 friends who purchase to earn a free replacement cartridge"}
      </p>
    </div>
  );
}
