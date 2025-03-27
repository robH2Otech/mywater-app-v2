
import { PrivateUserProfile } from "@/components/users/private/PrivateUserProfile";
import { ReferralProgram } from "@/components/users/private/ReferralProgram";
import { SupportContactForm } from "@/components/users/private/support/SupportContactForm";
import { InstallationGuide } from "@/components/users/private/support/InstallationGuide";
import { Share2, UserCircle, HelpCircle } from "lucide-react";
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
  const [supportView, setSupportView] = useState<"contact" | "installation">("contact");
  
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
            <TabTriggerItem 
              value="support" 
              label="Installation & Support" 
              icon={HelpCircle} 
            />
          </TabsList>
          
          <TabContentItem value="profile">
            <PrivateUserProfile userData={userData} />
          </TabContentItem>
          
          <TabContentItem value="referrals">
            <ReferralProgram userData={userData} />
          </TabContentItem>
          
          <TabContentItem value="support">
            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => setSupportView("contact")}
                  className={`px-4 py-2 rounded-md ${
                    supportView === "contact" 
                      ? "bg-mywater-blue text-white" 
                      : "bg-spotify-dark text-gray-300 hover:bg-spotify-accent"
                  }`}
                >
                  Contact Support
                </button>
                <button
                  onClick={() => setSupportView("installation")}
                  className={`px-4 py-2 rounded-md ${
                    supportView === "installation" 
                      ? "bg-mywater-blue text-white" 
                      : "bg-spotify-dark text-gray-300 hover:bg-spotify-accent"
                  }`}
                >
                  Installation Guide
                </button>
              </div>
              
              {supportView === "contact" ? (
                <SupportContactForm userData={userData} />
              ) : (
                <InstallationGuide purifierModel={userData?.purifier_model || "MYWATER System"} />
              )}
            </div>
          </TabContentItem>
        </Tabs>
      </Card>
    </div>
  );
}
