
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine where to navigate back to based on the current path
  const isPrivatePath = location.pathname.includes('private-dashboard');
  const dashboardPath = isPrivatePath ? "/private-dashboard" : "/auth";
  const buttonLabel = isPrivatePath ? "Return to Dashboard" : "Return to Login";
  
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-4">Oops! Page not found</p>
        <Button
          variant="outline"
          onClick={() => navigate(dashboardPath)}
          className="text-mywater-blue hover:text-mywater-blue hover:bg-mywater-blue/10"
        >
          <Home size={16} className="mr-2" />
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
