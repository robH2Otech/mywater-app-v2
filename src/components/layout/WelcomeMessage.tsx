
interface WelcomeMessageProps {
  firstName: string;
}

export const WelcomeMessage = ({ firstName }: WelcomeMessageProps) => {
  // Capitalize first letter of the name
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  return (
    <div className="text-white text-lg">
      Hey {capitalizedName}, welcome back!
    </div>
  );
};
