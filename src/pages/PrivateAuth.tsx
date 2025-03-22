
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/users/private/LoginForm";
import { PrivateUserRegisterForm } from "@/components/users/private/PrivateUserRegisterForm";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export function PrivateAuth() {
  const navigate = useNavigate();
  const {
    isLoading,
    socialLoading,
    authMode,
    email,
    password,
    setAuthMode,
    setEmail,
    setPassword,
    handleEmailAuth,
    handleSocialAuth
  } = useFirebaseAuth();

  const handleLoginTab = () => {
    setAuthMode("login");
  };

  const handleRegisterTab = () => {
    setAuthMode("register");
  };

  return (
    <div className="min-h-screen bg-spotify-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            MYWATER Home User Portal
          </h2>
          <p className="mt-2 text-gray-400">
            {authMode === "login"
              ? "Sign in to manage your water purification system"
              : "Create your account to get started"}
          </p>
        </div>

        <Card className="p-6 bg-spotify-darker border-spotify-accent shadow-lg">
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" onClick={handleLoginTab}>Sign In</TabsTrigger>
              <TabsTrigger value="register" onClick={handleRegisterTab}>Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleEmailAuth={handleEmailAuth}
                handleSocialAuth={handleSocialAuth}
                isLoading={isLoading}
                socialLoading={socialLoading}
              />
            </TabsContent>

            <TabsContent value="register">
              <PrivateUserRegisterForm socialEmail={email} />
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <Button variant="link" onClick={handleRegisterTab} className="p-0 h-auto text-mywater-blue">
                    Register here
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Button variant="link" onClick={handleLoginTab} className="p-0 h-auto text-mywater-blue">
                    Sign in
                  </Button>
                </>
              )}
            </p>
          </div>
        </Card>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-gray-300"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
