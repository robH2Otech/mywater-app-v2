
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";

interface RegisterFormFieldsProps {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phone: string;
  purchaseDate: Date | null;
  password: string;
  confirmPassword: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setEmail: (value: string) => void;
  setAddress: (value: string) => void;
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
  address,
  phone,
  purchaseDate,
  password,
  confirmPassword,
  setFirstName,
  setLastName,
  setEmail,
  setAddress,
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
    </>
  );
}
