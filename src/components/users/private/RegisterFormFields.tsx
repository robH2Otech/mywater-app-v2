
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";

interface RegisterFormFieldsProps {
  firstName: string;
  lastName: string;
  email: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  purchaseDate: Date | null;
  password: string;
  confirmPassword: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setEmail: (value: string) => void;
  setStreetAddress: (value: string) => void;
  setCity: (value: string) => void;
  setPostalCode: (value: string) => void;
  setCountry: (value: string) => void;
  setPhone: (value: string) => void;
  setPurchaseDate: (date: Date | null) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  socialEmail?: string;
}

export function RegisterFormFields({
  firstName,
  lastName,
  email,
  streetAddress,
  city,
  postalCode,
  country,
  phone,
  purchaseDate,
  password,
  confirmPassword,
  setFirstName,
  setLastName,
  setEmail,
  setStreetAddress,
  setCity,
  setPostalCode,
  setCountry,
  setPhone,
  setPurchaseDate,
  setPassword,
  setConfirmPassword,
  socialEmail = ""
}: RegisterFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          value={firstName}
          onChange={setFirstName}
          required
          placeholder="John"
        />
        <FormInput
          label="Last Name"
          value={lastName}
          onChange={setLastName}
          required
          placeholder="Doe"
        />
      </div>
      
      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        disabled={!!socialEmail}
        placeholder="your.email@example.com"
      />
      
      <FormInput
        label="Street Address"
        value={streetAddress}
        onChange={setStreetAddress}
        required
        placeholder="123 Main Street"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          label="City"
          value={city}
          onChange={setCity}
          required
          placeholder="New York"
        />
        <FormInput
          label="Postal/ZIP Code"
          value={postalCode}
          onChange={setPostalCode}
          required
          placeholder="10001"
        />
        <FormInput
          label="Country"
          value={country}
          onChange={setCountry}
          required
          placeholder="United States"
        />
      </div>
      
      <FormInput
        label="Phone Number"
        value={phone}
        onChange={setPhone}
        required
        placeholder="+1 555-123-4567"
      />
      
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
            placeholder="Min. 6 characters"
          />
          <FormInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={6}
            placeholder="Confirm your password"
          />
        </div>
      )}
    </>
  );
}
