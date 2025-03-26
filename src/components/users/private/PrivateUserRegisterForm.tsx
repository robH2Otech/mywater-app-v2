
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
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [purifierModel, setPurifierModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(new Date());
  
  const { isLoading, handleRegister } = useRegisterFormHandler();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct full address
    const fullAddress = `${streetAddress}, ${city}, ${postalCode}, ${country}`.trim();
    
    handleRegister({
      firstName,
      lastName,
      email,
      address: fullAddress,
      streetAddress,
      city,
      postalCode,
      country,
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
        streetAddress={streetAddress}
        city={city}
        postalCode={postalCode}
        country={country}
        phone={phone}
        purchaseDate={purchaseDate}
        password={password}
        confirmPassword={confirmPassword}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setEmail={setEmail}
        setStreetAddress={setStreetAddress}
        setCity={setCity}
        setPostalCode={setPostalCode}
        setCountry={setCountry}
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
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3"
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
