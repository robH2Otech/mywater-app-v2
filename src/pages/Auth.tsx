
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BusinessAuthForm } from "@/components/users/business/BusinessAuthForm";
import { TempAccessButton } from "@/components/users/business/TempAccessButton";
import { UserMigrationHandler } from "@/components/users/business/UserMigrationHandler";
import MatrixRain from "@/components/ui/matrix-rain";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <UserMigrationHandler>
      <div className="min-h-screen bg-spotify-dark flex items-center justify-center p-4 relative overflow-hidden">
        {/* Matrix Rain Background */}
        <MatrixRain 
          fontSize={16}
          color="#39afcd"
          characters="10MYWATER"
          fadeOpacity={0.05}
          speed={0.8}
        />
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-spotify-dark/90 to-spotify-dark/70 z-0"></div>
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Welcome to <span className="text-mywater-blue">MYWATER app</span>
            </h2>
            <p className="mt-2 text-gray-400">
              {isLogin
                ? "Please sign in to continue"
                : "Please sign up to get started"}
            </p>
          </div>

          <div className="bg-spotify-darker p-8 rounded-lg border border-spotify-accent/50 shadow-xl">
            <BusinessAuthForm 
              isLogin={isLogin} 
              setIsLogin={setIsLogin} 
            />

            <div className="text-center space-y-4 mt-6">
              <p className="text-mywater-blue">
                Contact us for account: contact@mywatertechnologies.com
              </p>
              
              <div className="pt-2 border-t border-gray-700">
                <TempAccessButton />
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-gray-300"
            >
              <Home size={16} className="mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </UserMigrationHandler>
  );
};

export default Auth;
