
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PrivateUserEditForm } from "./PrivateUserEditForm";
import { PrivateUserProfileDisplay } from "./PrivateUserProfileDisplay";
import { PrivateUser } from "@/types/privateUser";

interface PrivateUserProfileProps {
  userData: PrivateUser | any;
}

export function PrivateUserProfile({ userData }: PrivateUserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localUserData, setLocalUserData] = useState(userData);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleSave = (updatedData: any) => {
    // Update local userData
    setLocalUserData(updatedData);
    setIsEditing(false);
  };
  
  return (
    <div className="space-y-6">
      {isEditing ? (
        <PrivateUserEditForm 
          userData={localUserData}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      ) : (
        <PrivateUserProfileDisplay 
          userData={localUserData}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
