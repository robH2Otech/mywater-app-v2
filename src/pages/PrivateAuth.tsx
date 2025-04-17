
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/users/private/LoginForm";
import { PrivateUserRegisterForm } from "@/components/users/private/PrivateUserRegisterForm";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Droplets, Home } from "lucide-react";
import MatrixRain from "@/components/ui/matrix-rain";

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
    <div className="min-h-screen bg-gradient-to-b from-spotify-dark to-black flex items-center justify-center p-4 relative overflow-hidden">
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
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-full">
              <Droplets size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            MYWATER Private User Portal
          </h2>
          <p className="mt-2 text-gray-400">
            {authMode === "login"
              ? "Sign in to manage your water purification system"
              : "Create your account to get started"}
          </p>
        </div>

        <Card className="p-6 bg-spotify-darker border-spotify-accent shadow-xl rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-spotify-dark">
              <TabsTrigger 
                value="login" 
                onClick={handleLoginTab}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                onClick={handleRegisterTab}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                Register
              </TabsTrigger>
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
                  <Button variant="link" onClick={handleRegisterTab} className="p-0 h-auto text-cyan-400 hover:text-cyan-300">
                    Register here
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Button variant="link" onClick={handleLoginTab} className="p-0 h-auto text-cyan-400 hover:text-cyan-300">
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
            <Home size={16} className="mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
