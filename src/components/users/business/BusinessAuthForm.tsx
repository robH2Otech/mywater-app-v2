
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { useToast } from "@/hooks/use-toast";
import { useBusinessAuth } from "@/hooks/auth/useBusinessAuth";

interface BusinessAuthFormProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
}

export function BusinessAuthForm({ isLogin, setIsLogin }: BusinessAuthFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser, registerUser, isLoading } = useBusinessAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        console.log("Attempting login for:", email);
        const success = await loginUser(email, password);
        
        if (success) {
          toast({
            title: "Success",
            description: "Welcome back! Redirecting to dashboard...",
          });
          navigate("/dashboard");
        }
      } else {
        console.log("Attempting registration for:", email);
        const success = await registerUser(email, password);
        
        if (success) {
          toast({
            title: "Success", 
            description: "Account created successfully. You may now sign in.",
          });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleAuth} className="space-y-6">
      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />
      <FormInput
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        minLength={6}
      />

      <Button
        type="submit"
        className="w-full bg-mywater-blue hover:bg-mywater-blue/90"
        disabled={isLoading}
      >
        {isLoading
          ? "Loading..."
          : isLogin
          ? "Sign In"
          : "Create Account"}
      </Button>
    </form>
  );
}
