
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BusinessAuthForm } from "@/components/users/business/BusinessAuthForm";
import { TempAccessButton } from "@/components/users/business/TempAccessButton";
import { UserMigrationHandler } from "@/components/users/business/UserMigrationHandler";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <UserMigrationHandler>
      <div className="min-h-screen bg-spotify-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-spotify-darker p-8 rounded-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Welcome back to MYWATER app
            </h2>
            <p className="mt-2 text-gray-400">
              {isLogin
                ? "Please sign in to continue"
                : "Please sign up to get started"}
            </p>
          </div>

          <BusinessAuthForm 
            isLogin={isLogin} 
            setIsLogin={setIsLogin} 
          />

          <div className="text-center space-y-4">
            <p className="text-mywater-blue">
              Contact us for account: contact@mywatertechnologies.com
            </p>
            
            <div className="pt-2 border-t border-gray-700">
              <TempAccessButton />
            </div>
          </div>
        </div>
      </div>
    </UserMigrationHandler>
  );
}
