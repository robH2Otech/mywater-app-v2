
import { Droplet, Calendar, Bell, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DocumentData } from "firebase/firestore";

interface PrivateDashboardStatsProps {
  userData: DocumentData | null;
  daysUntilReplacement: number | null;
  isReplacementDueSoon: boolean;
  isReplacementOverdue: boolean;
}

export function PrivateDashboardStats({
  userData,
  daysUntilReplacement,
  isReplacementDueSoon,
  isReplacementOverdue
}: PrivateDashboardStatsProps) {
  // Text and color for the replacement card
  const getReplacementData = () => {
    if (isReplacementOverdue) {
      return {
        value: "Overdue",
        color: "text-red-500",
        subValue: `${Math.abs(daysUntilReplacement || 0)} days past due`,
        subValueColor: "text-red-400"
      };
    } else if (isReplacementDueSoon) {
      return {
        value: daysUntilReplacement || 0,
        color: "text-yellow-500",
        subValue: "days until replacement",
        subValueColor: "text-yellow-400"
      };
    } else {
      return {
        value: daysUntilReplacement || 0,
        color: "text-green-500",
        subValue: "days until replacement",
        subValueColor: "text-green-400"
      };
    }
  };

  const replacementData = getReplacementData();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Water Purifier"
        value={userData?.purifier_model || "MYWATER System"}
        icon={Droplet}
        link="/private-dashboard"
        iconColor="text-mywater-blue"
      />
      
      <StatCard
        title="Filter Changes"
        value={replacementData.value}
        icon={Calendar}
        link="/private-dashboard"
        iconColor={replacementData.color}
        subValue={replacementData.subValue}
        subValueColor={replacementData.subValueColor}
      />
      
      <StatCard
        title="Referral Program"
        value={`${userData?.referrals_converted || 0}/3`}
        icon={Bell}
        link="/private-dashboard"
        iconColor="text-mywater-blue"
        subValue="Friends purchased"
      />
      
      <StatCard
        title="Water Quality"
        value="Excellent"
        icon={BarChart3}
        link="/private-dashboard"
        iconColor="text-green-500"
        subValue="Last tested: Today"
      />
    </div>
  );
}
