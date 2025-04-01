
import { Card } from "@/components/ui/card";

interface UsersErrorProps {
  message?: string;
}

export function UsersError({ message = "Error loading users. Please try again." }: UsersErrorProps) {
  return (
    <Card className="bg-spotify-darker border-spotify-accent p-6 rounded-lg">
      <div className="text-red-400">{message}</div>
    </Card>
  );
}
