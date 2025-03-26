
import { PrivateUserProfile } from "@/components/users/private/PrivateUserProfile";
import { ReferralProgram } from "@/components/users/private/ReferralProgram";
import { Share2, UserCircle } from "lucide-react";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { useState } from "react";
import { DocumentData } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { TabTriggerItem } from "./TabTriggerItem";
import { TabContentItem } from "./TabContentItem";

interface DashboardTabsProps {
  userData: DocumentData | null;
}

export function DashboardTabs({ userData }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("profile");
  
  return (
    <div className="space-y-6">
      <Card className="bg-spotify-darker border-spotify-accent p-4">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-spotify-dark">
            <TabTriggerItem 
              value="profile" 
              label="My Profile" 
              icon={UserCircle} 
            />
            <TabTriggerItem 
              value="referrals" 
              label="Referral Program" 
              icon={Share2} 
            />
          </TabsList>
          
          <TabContentItem value="profile">
            <PrivateUserProfile userData={userData} />
          </TabContentItem>
          
          <TabContentItem value="referrals">
            <ReferralProgram userData={userData} />
          </TabContentItem>
        </Tabs>
      </Card>
    </div>
  );
}
