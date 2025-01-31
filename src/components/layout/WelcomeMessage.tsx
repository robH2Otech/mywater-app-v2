interface WelcomeMessageProps {
  firstName: string;
}

export const WelcomeMessage = ({ firstName }: WelcomeMessageProps) => {
  return (
    <div className="text-white text-lg">
      Hey {firstName}, welcome back!
    </div>
  );
};