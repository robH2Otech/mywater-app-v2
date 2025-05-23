
import { useState } from "react";
import { PrivateUserProfile } from "@/components/users/private/PrivateUserProfile";
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";
import { motion } from "framer-motion";
import { PrivateUserEditForm } from "@/components/users/private/PrivateUserEditForm";

export function ProfilePage() {
  const { userData, loading } = usePrivateUserData();
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleSaveEdit = (updatedData: any) => {
    // Logic to handle the updated user data will be added here if needed
    setIsEditing(false);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-300/80 mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 bg-clip-text text-transparent">
          My Profile
        </h2>
        <p className="text-blue-300/80 mt-1">Manage your account and device information</p>
      </div>
      
      {isEditing ? (
        <PrivateUserEditForm 
          userData={userData} 
          onCancel={handleCancelEdit}
          onSave={handleSaveEdit}
        />
      ) : (
        <PrivateUserProfile 
          userData={userData} 
          onEdit={handleEdit}
        />
      )}
    </motion.div>
  );
}
