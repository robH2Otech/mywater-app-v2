
import { User, Home, Phone, Mail, Calendar, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface PrivateUserProfileDisplayProps {
  userData: any;
  onEdit: () => void;
}

export function PrivateUserProfileDisplay({ userData, onEdit }: PrivateUserProfileDisplayProps) {
  // Format dates
  const formattedPurchaseDate = userData?.purchase_date 
    ? format(userData.purchase_date.toDate(), 'MMMM d, yyyy')
    : 'Not available';
  
  const formattedReplacementDate = userData?.cartridge_replacement_date 
    ? format(userData.cartridge_replacement_date.toDate(), 'MMMM d, yyyy')
    : 'Not available';
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Personal Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-white">{userData?.first_name} {userData?.last_name}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{userData?.email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Address</p>
                <p className="text-white">{userData?.address || "Not provided"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white">{userData?.phone || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Purifier Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Purifier Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div>
                <p className="text-sm text-gray-400">Model</p>
                <p className="text-white">{userData?.purifier_model || "Not available"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Purchase Date</p>
                <p className="text-white">{formattedPurchaseDate}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Cartridge Replacement Due</p>
                <p className="text-white">{formattedReplacementDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={onEdit}
          className="bg-spotify-accent hover:bg-spotify-accent-hover"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Contact Info
        </Button>
      </div>
    </div>
  );
}
