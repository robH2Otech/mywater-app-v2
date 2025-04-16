
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PrivateUser } from "@/types/privateUser";
import { format } from "date-fns";
import { PrivateUserEditForm } from "./PrivateUserEditForm";
import { PrivateUserProfileDisplay } from "./PrivateUserProfileDisplay";

interface PrivateUserProfileProps {
  userData: PrivateUser | null;
}

export function PrivateUserProfile({ userData }: PrivateUserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState<PrivateUser | null>(userData);
  
  // Calculate cartridge usage percentage (mock data - would be calculated from actual dates)
  const cartridgeUsagePercent = 65;
  
  const handleSave = (newUserData: PrivateUser) => {
    setUpdatedUserData(newUserData);
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <PrivateUserEditForm 
          userData={updatedUserData} 
          onCancel={() => setIsEditing(false)} 
          onSave={handleSave}
        />
      ) : (
        <PrivateUserProfileDisplay 
          userData={updatedUserData} 
          onEdit={() => setIsEditing(true)}
          cartridgeUsagePercent={cartridgeUsagePercent}
        />
      )}
    </div>
  );
}
