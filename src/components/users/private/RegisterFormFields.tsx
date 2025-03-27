
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
          placeholder="Jean"
        />
        <FormInput
          label="Last Name"
          value={lastName}
          onChange={setLastName}
          required
          placeholder="Dupont"
        />
      </div>
      
      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        disabled={!!socialEmail}
        placeholder="jean.dupont@example.fr"
      />
      
      <FormInput
        label="Street Address"
        value={streetAddress}
        onChange={setStreetAddress}
        required
        placeholder="15 Rue de la Paix"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          label="City"
          value={city}
          onChange={setCity}
          required
          placeholder="Paris"
        />
        <FormInput
          label="Post Code"
          value={postalCode}
          onChange={setPostalCode}
          required
          placeholder="75001"
        />
        <FormInput
          label="Country"
          value={country}
          onChange={setCountry}
          required
          placeholder="France"
        />
      </div>
      
      <FormInput
        label="Phone Number"
        value={phone}
        onChange={setPhone}
        required
        placeholder="+33 1 23 45 67 89"
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
