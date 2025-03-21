
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { createUserWithEmailAndPassword, getAuth, updateProfile } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

// Sample purifier models - this would come from a database in production
const PURIFIER_MODELS = [
  "MYWATER Home Basic",
  "MYWATER Home Plus",
  "MYWATER Home Premium",
  "MYWATER Under-Sink Basic",
  "MYWATER Under-Sink Advanced",
  "MYWATER Countertop Standard",
  "MYWATER Countertop Premium"
];

interface PrivateUserRegisterFormProps {
  socialEmail?: string;
}

export function PrivateUserRegisterForm({ socialEmail = "" }: PrivateUserRegisterFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState(socialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [purifierModel, setPurifierModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(new Date());

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!socialEmail && password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (!purifierModel) {
      toast({
        title: "Purifier model required",
        description: "Please select your water purifier model.",
        variant: "destructive",
      });
      return;
    }

    if (!purchaseDate) {
      toast({
        title: "Purchase date required",
        description: "Please select when you purchased your water purifier.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Determine if we're using social login or email/password
      let user;
      
      if (socialEmail) {
        // User is already authenticated via social login
        user = auth.currentUser;
        
        if (!user) {
          throw new Error("User session expired. Please sign in again.");
        }
        
        // Update user profile if needed
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`
        });
      } else {
        // Create user account with email/password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      }
      
      // Calculate cartridge replacement date (1 year from purchase)
      const replacementDate = new Date(purchaseDate);
      replacementDate.setFullYear(replacementDate.getFullYear() + 1);
      
      // Store additional user data in app_users_privat collection
      await addDoc(collection(db, "app_users_privat"), {
        uid: user.uid,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        address: address,
        phone: phone,
        purifier_model: purifierModel,
        purchase_date: purchaseDate,
        cartridge_replacement_date: replacementDate,
        referrals_count: 0,
        referrals_converted: 0,
        referral_reward_earned: false,
        referral_reward_claimed: false,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // Create a unique referral code
      const referralCode = `${firstName.toLowerCase().substring(0, 3)}${lastName.toLowerCase().substring(0, 3)}${Math.floor(Math.random() * 10000)}`;
      
      await addDoc(collection(db, "referral_codes"), {
        user_id: user.uid,
        code: referralCode,
        created_at: new Date()
      });
      
      toast({
        title: "Account created successfully",
        description: "Welcome to MYWATER! You can now sign in with your credentials.",
      });
      
      // Redirect to login tab
      navigate("/private-dashboard");
      
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          value={firstName}
          onChange={setFirstName}
          required
        />
        <FormInput
          label="Last Name"
          value={lastName}
          onChange={setLastName}
          required
        />
      </div>
      
      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        disabled={!!socialEmail}
      />
      
      <FormInput
        label="Address"
        value={address}
        onChange={setAddress}
        required
      />
      
      <FormInput
        label="Phone Number"
        value={phone}
        onChange={setPhone}
        required
      />
      
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Water Purifier Model</label>
        <Select value={purifierModel} onValueChange={setPurifierModel} required>
          <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
            <SelectValue placeholder="Select your purifier model" />
          </SelectTrigger>
          <SelectContent className="bg-spotify-darker border-spotify-accent">
            {PURIFIER_MODELS.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <FormDatePicker
        label="Purchase Date"
        value={purchaseDate}
        onChange={setPurchaseDate}
      />
      
      {!socialEmail && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
            minLength={6}
          />
          <FormInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={6}
          />
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-mywater-blue hover:bg-mywater-blue/90"
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
