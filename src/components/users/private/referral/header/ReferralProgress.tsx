
interface ReferralProgressProps {
  referralsCount: number;
  referralsNeeded: number;
  referralsRemaining: number;
}

export function ReferralProgress({ 
  referralsCount, 
  referralsNeeded, 
  referralsRemaining 
}: ReferralProgressProps) {
  return (
    <div className="p-4 rounded-lg bg-blue-950/40 border border-blue-800/30">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-blue-200">Your Progress</h3>
        <span className="text-sm text-blue-300 px-2 py-1 bg-blue-500/20 rounded">
          {referralsCount} of {referralsNeeded}
        </span>
      </div>
      <div className="h-2.5 w-full bg-blue-950 rounded-full mt-2">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
          style={{ width: `${(referralsCount / referralsNeeded) * 100}%` }}
        />
      </div>
      {referralsRemaining > 0 && (
        <p className="text-sm text-blue-300 mt-2">
          {referralsRemaining} more to unlock your free cartridge!
        </p>
      )}
    </div>
  );
}
