
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RegisterFormFields } from "./RegisterFormFields";
import { PurifierModelSelect } from "./PurifierModelSelect";
import { useRegisterFormHandler } from "./RegisterFormHandler";

interface PrivateUserRegisterFormProps {
  socialEmail?: string;
}

export function PrivateUserRegisterForm({ socialEmail = "" }: PrivateUserRegisterFormProps) {
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
  
  const { isLoading, handleRegister } = useRegisterFormHandler();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    handleRegister({
      firstName,
      lastName,
      email,
      address,
      phone,
      purchaseDate,
      purifierModel,
      password,
      confirmPassword,
      socialEmail
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <RegisterFormFields
        firstName={firstName}
        lastName={lastName}
        email={email}
        address={address}
        phone={phone}
        purchaseDate={purchaseDate}
        password={password}
        confirmPassword={confirmPassword}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setEmail={setEmail}
        setAddress={setAddress}
        setPhone={setPhone}
        setPurchaseDate={setPurchaseDate}
        setPassword={setPassword}
        setConfirmPassword={setConfirmPassword}
        socialEmail={socialEmail}
      />
      
      <PurifierModelSelect 
        value={purifierModel}
        onChange={setPurifierModel}
      />

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
