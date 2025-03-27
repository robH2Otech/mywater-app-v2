
import { Button } from "@/components/ui/button";
import { Edit, User, MapPin, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Personal Information</h2>
        <Button 
          onClick={onEdit}
          variant="outline"
          className="bg-mywater-blue hover:bg-mywater-blue/90 text-white"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>
      
      <Card className="bg-spotify-dark border-spotify-accent">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 text-mywater-blue mr-2" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Name</p>
              <p className="text-lg text-white">{`${userData.first_name || ''} ${userData.last_name || ''}`}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Email Address</p>
              <p className="text-lg text-white">{userData.email || ''}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Phone Number</p>
              <p className="text-lg text-white">{userData.phone || ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-spotify-dark border-spotify-accent">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="h-5 w-5 text-mywater-blue mr-2" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Street Address</p>
              <p className="text-lg text-white">{userData.street_address || ''}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-400">City</p>
                <p className="text-lg text-white">{userData.city || ''}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-400">Post Code</p>
                <p className="text-lg text-white">{userData.postal_code || ''}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-400">Country</p>
                <p className="text-lg text-white">{userData.country || ''}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-spotify-dark border-spotify-accent">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Info className="h-5 w-5 text-mywater-blue mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Purifier Model</p>
              <p className="text-lg text-white">{userData.purifier_model || ''}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Purchase Date</p>
              <p className="text-lg text-white">
                {userData.purchase_date 
                  ? (userData.purchase_date.toDate 
                     ? new Date(userData.purchase_date.toDate()).toLocaleDateString() 
                     : new Date(userData.purchase_date).toLocaleDateString())
                  : ''}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Purchase Price</p>
              <p className="text-lg text-white">{userData.purchase_price ? `€${userData.purchase_price}` : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
