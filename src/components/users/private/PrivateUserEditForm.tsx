
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
  onSave: (updatedData: any) => void;
}

export function PrivateUserEditForm({ userData, onCancel, onSave }: PrivateUserEditFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit form state
  const [firstName, setFirstName] = useState(userData?.first_name || "");
  const [lastName, setLastName] = useState(userData?.last_name || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [streetAddress, setStreetAddress] = useState(userData?.street_address || "");
  const [city, setCity] = useState(userData?.city || "");
  const [postalCode, setPostalCode] = useState(userData?.postal_code || "");
  const [country, setCountry] = useState(userData?.country || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  
  const handleSave = async () => {
    if (!userData?.uid) {
      toast({
        title: "Error",
        description: "Could not update profile: User data not found",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Determine which collection to use
      const collectionName = "app_users_privat";
      
      // Update in the appropriate collection
      const userDocRef = doc(db, collectionName, userData.uid);
      
      const updatedData = {
        first_name: firstName,
        last_name: lastName,
        email,
        street_address: streetAddress,
        city,
        postal_code: postalCode,
        country,
        phone,
        updated_at: new Date()
      };
      
      await updateDoc(userDocRef, updatedData);
      
      // Return updated data to parent component
      onSave({
        ...userData,
        ...updatedData
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          value={firstName}
          onChange={setFirstName}
          placeholder="Jean"
        />
        <FormInput
          label="Last Name"
          value={lastName}
          onChange={setLastName}
          placeholder="Dupont"
        />
      </div>
      
      <FormInput
        label="Email Address"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="jean.dupont@example.fr"
      />
      
      <FormInput
        label="Street Address"
        value={streetAddress}
        onChange={setStreetAddress}
        placeholder="15 Rue de la Paix"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          label="City"
          value={city}
          onChange={setCity}
          placeholder="Paris"
        />
        <FormInput
          label="Post Code"
          value={postalCode}
          onChange={setPostalCode}
          placeholder="75001"
        />
        <FormInput
          label="Country"
          value={country}
          onChange={setCountry}
          placeholder="France"
        />
      </div>
      
      <FormInput
        label="Phone Number"
        value={phone}
        onChange={setPhone}
        placeholder="+33 1 23 45 67 89"
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
