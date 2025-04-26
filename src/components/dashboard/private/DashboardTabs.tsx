
import { PrivateUserProfile } from "@/components/users/private/PrivateUserProfile";
import { ReferralProgram } from "@/components/users/private/ReferralProgram";
import { SupportContactForm } from "@/components/users/private/support/SupportContactForm";
import { InstallationGuide } from "@/components/users/private/support/InstallationGuide";
import { Share2, UserCircle, HelpCircle, Wrench } from "lucide-react";
import { useState } from "react";
import { DocumentData } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { TabContentItem } from "./TabContentItem";
import { PrivateUser } from "@/types/privateUser";
import { PrivateUserEditForm } from "@/components/users/private/PrivateUserEditForm";
import { EnhancedTabs } from "@/components/ui/enhanced-tabs";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";

interface DashboardTabsProps {
  userData: DocumentData | null;
}

export function DashboardTabs({ userData }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  
  const privateUserData = userData as PrivateUser | null;

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => setIsEditing(false);
  const handleSaveEdit = () => setIsEditing(false);
  
  const tabItems = [
    { value: "profile", label: "My Profile", icon: <UserCircle className="h-4 w-4" /> },
    { value: "referrals", label: "Referral Program", icon: <Share2 className="h-4 w-4" /> },
    { value: "installation", label: "Installation Guide", icon: <Wrench className="h-4 w-4" /> },
    { value: "support", label: "Contact Support", icon: <HelpCircle className="h-4 w-4" /> }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <GlassCard className="p-4" gradient>
        <EnhancedTabs
          value={activeTab}
          onValueChange={setActiveTab}
          items={tabItems}
        >
          <TabContentItem value="profile">
            {isEditing ? (
              <PrivateUserEditForm 
                userData={privateUserData} 
                onCancel={handleCancelEdit}
                onSave={handleSaveEdit}
              />
            ) : (
              <PrivateUserProfile
                userData={privateUserData}
                onEdit={handleEdit}
              />
            )}
          </TabContentItem>
          
          <TabContentItem value="referrals">
            <ReferralProgram userData={userData} />
          </TabContentItem>
          
          <TabContentItem value="installation">
            <InstallationGuide purifierModel={userData?.purifier_model || "MYWATER System"} />
          </TabContentItem>
          
          <TabContentItem value="support">
            <SupportContactForm userData={userData} />
          </TabContentItem>
        </EnhancedTabs>
      </GlassCard>
    </motion.div>
  );
}
