
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PrivateUserEditForm } from "./PrivateUserEditForm";
import { PrivateUserProfileDisplay } from "./PrivateUserProfileDisplay";

interface PrivateUserProfileProps {
  userData: any;
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
  
  const handleSave = (updatedData: { address: string; phone: string; email: string }) => {
    // Update local userData
    setLocalUserData({
      ...localUserData,
      ...updatedData
    });
    
    setIsEditing(false);
  };
  
  // Get user initials for avatar
  const getInitials = () => {
    const first = localUserData?.first_name || "";
    const last = localUserData?.last_name || "";
    
    if (first && last) {
      return `${first[0]}${last[0]}`.toUpperCase();
    } else if (first) {
      return first.substring(0, 2).toUpperCase();
    }
    
    return "U";
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-spotify-darker border-spotify-accent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-mywater-blue" />
              My Profile
            </CardTitle>
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-mywater-blue text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardDescription>
            Your personal information and water purifier details
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
