
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Calendar, 
  Home, 
  Phone, 
  Mail,
  Save,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { db } from "@/integrations/firebase/client";
import { doc, updateDoc } from "firebase/firestore";

interface PrivateUserProfileProps {
  userData: any;
}

export function PrivateUserProfile({ userData }: PrivateUserProfileProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit form state
  const [address, setAddress] = useState(userData?.address || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [email, setEmail] = useState(userData?.email || "");
  
  const handleEdit = () => {
    setAddress(userData?.address || "");
    setPhone(userData?.phone || "");
    setEmail(userData?.email || "");
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    if (!userData?.id) {
      toast({
        title: "Error",
        description: "Could not update profile: User data not found",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userDocRef = doc(db, "private_users", userData.id);
      
      await updateDoc(userDocRef, {
        address,
        phone,
        email,
        updated_at: new Date()
      });
      
      // Update local userData
      userData.address = address;
      userData.phone = phone;
      userData.email = email;
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format dates
  const formattedPurchaseDate = userData?.purchase_date 
    ? format(userData.purchase_date.toDate(), 'MMMM d, yyyy')
    : 'Not available';
  
  const formattedReplacementDate = userData?.cartridge_replacement_date 
    ? format(userData.cartridge_replacement_date.toDate(), 'MMMM d, yyyy')
    : 'Not available';
  
  return (
    <div className="space-y-6">
      <Card className="bg-spotify-darker border-spotify-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-mywater-blue" />
            My Profile
          </CardTitle>
          <CardDescription>
            Your personal information and water purifier details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <FormInput
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
              />
              
              <FormInput
                label="Address"
                value={address}
                onChange={setAddress}
              />
              
              <FormInput
                label="Phone Number"
                value={phone}
                onChange={setPhone}
              />
              
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-mywater-blue hover:bg-mywater-blue/90"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
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
                        <p className="text-white">{userData?.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Phone</p>
                        <p className="text-white">{userData?.phone}</p>
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
                        <p className="text-white">{userData?.purifier_model}</p>
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
                  onClick={handleEdit}
                  className="bg-spotify-accent hover:bg-spotify-accent-hover"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Contact Info
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
