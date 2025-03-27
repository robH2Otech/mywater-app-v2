
import { useState } from "react";
import { FormInput } from "@/components/shared/FormInput";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

interface PrivateUserEditFormProps {
  userData: any;
  onCancel: () => void;
  onSave: (updatedData: { address: string; phone: string; email: string }) => void;
}

export function PrivateUserEditForm({ userData, onCancel, onSave }: PrivateUserEditFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit form state
  const [email, setEmail] = useState(userData?.email || "");
  const [streetAddress, setStreetAddress] = useState(userData?.street_address || "");
  const [city, setCity] = useState(userData?.city || "");
  const [postalCode, setPostalCode] = useState(userData?.postal_code || "");
  const [country, setCountry] = useState(userData?.country || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  
  const handleSave = async () => {
    if (!userData?.id || !userData?.uid) {
      toast({
        title: "Error",
        description: "Could not update profile: User data not found",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Construct full address
      const fullAddress = `${streetAddress}, ${city}, ${postalCode}, ${country}`.trim();
      
      // Determine which collection to use
      const collectionName = "app_users_privat";
      
      // Update in the appropriate collection
      const userDocRef = doc(db, collectionName, userData.uid);
      
      await updateDoc(userDocRef, {
        email,
        address: fullAddress,
        street_address: streetAddress,
        city,
        postal_code: postalCode,
        country,
        phone,
        updated_at: new Date()
      });
      
      // Return updated data to parent component
      onSave({ 
        address: fullAddress, 
        phone, 
        email 
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
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

  return (
    <div className="space-y-4">
      <FormInput
        label="Email Address"
        type="email"
        value={email}
        onChange={setEmail}
      />
      
      <FormInput
        label="Street Address"
        value={streetAddress}
        onChange={setStreetAddress}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          label="City"
          value={city}
          onChange={setCity}
        />
        <FormInput
          label="Post Code"
          value={postalCode}
          onChange={setPostalCode}
        />
        <FormInput
          label="Country"
          value={country}
          onChange={setCountry}
        />
      </div>
      
      <FormInput
        label="Phone Number"
        value={phone}
        onChange={setPhone}
      />
      
      <div className="flex gap-3 justify-end mt-6">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-mywater-blue hover:bg-mywater-blue/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
