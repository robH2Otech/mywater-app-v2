
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if user is in private or business section based on URL
  const isPrivateDashboard = location.pathname.startsWith("/private-dashboard");
  const dashboardPath = isPrivateDashboard ? "/private-dashboard" : "/auth";
  const buttonLabel = isPrivateDashboard ? "Return to Dashboard" : "Return to Login";

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-spotify-dark">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-4">Oops! Page not found</p>
        <Button
          variant="outline"
          onClick={() => navigate(dashboardPath)}
          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
        >
          <Home size={16} className="mr-2" />
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
