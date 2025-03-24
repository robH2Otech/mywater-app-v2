
import { PrivateUserProfile } from "@/components/users/private/PrivateUserProfile";
import { ReferralProgram } from "@/components/users/private/ReferralProgram";
import { Share2, UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { DocumentData } from "firebase/firestore";

interface DashboardTabsProps {
  userData: DocumentData | null;
}

export function DashboardTabs({ userData }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("profile");
  
  return (
    <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="profile" className="flex gap-1">
          <UserCircle className="h-4 w-4" />
          My Profile
        </TabsTrigger>
        <TabsTrigger value="referrals" className="flex gap-1">
          <Share2 className="h-4 w-4" />
          Referral Program
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <PrivateUserProfile userData={userData} />
      </TabsContent>
      
      <TabsContent value="referrals">
        <ReferralProgram userData={userData} />
      </TabsContent>
    </Tabs>
  );
}
