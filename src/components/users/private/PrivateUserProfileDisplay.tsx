
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface PrivateUserProfileDisplayProps {
  userData: any;
  onEdit: () => void;
}

export function PrivateUserProfileDisplay({ userData, onEdit }: PrivateUserProfileDisplayProps) {
  if (!userData) {
    return <p className="text-gray-400">Loading profile data...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Name</p>
            <p className="text-white">{`${userData.first_name || ''} ${userData.last_name || ''}`}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Email Address</p>
            <p className="text-white">{userData.email || ''}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Phone Number</p>
            <p className="text-white">{userData.phone || ''}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white">Address</h3>
        <div>
          <p className="text-sm text-gray-400">Street Address</p>
          <p className="text-white">{userData.street_address || ''}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400">City</p>
            <p className="text-white">{userData.city || ''}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Post Code</p>
            <p className="text-white">{userData.postal_code || ''}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Country</p>
            <p className="text-white">{userData.country || ''}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Purifier Model</p>
            <p className="text-white">{userData.purifier_model || ''}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Purchase Date</p>
            <p className="text-white">
              {userData.purchase_date 
                ? new Date(userData.purchase_date.seconds * 1000).toLocaleDateString() 
                : ''}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button 
          onClick={onEdit}
          className="bg-mywater-blue hover:bg-mywater-blue/90"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
