
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Droplet, Shield, Users } from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>("business");

  const handleContinue = () => {
    if (selectedOption === "business") {
      navigate("/auth");
    } else {
      navigate("/private-auth");
    }
  };

  return (
    <div className="min-h-screen bg-spotify-dark flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Welcome to <span className="text-mywater-blue">MYWATER</span> Technologies
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Advanced water purification solutions for businesses and homeowners
          </p>
        </div>

        {/* Option Cards */}
        <Tabs defaultValue="business" className="w-full" onValueChange={setSelectedOption}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="business">Business Client</TabsTrigger>
            <TabsTrigger value="private">Home User</TabsTrigger>
          </TabsList>
          
          <TabsContent value="business" className="space-y-4">
            <Card className="glass transition-all hover:border-mywater-blue/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-mywater-blue" />
                  Business Water Management
                </CardTitle>
                <CardDescription>
                  For commercial clients managing multiple water purification units
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Monitor and manage multiple water purification units</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Advanced analytics and reporting tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Technical support and service management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="private" className="space-y-4">
            <Card className="glass transition-all hover:border-mywater-blue/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-mywater-blue" />
                  Home Water Purification
                </CardTitle>
                <CardDescription>
                  For home users with MYWATER purification products
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Track your purifier's maintenance schedule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Refer friends and earn free replacement cartridges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Get timely reminders for cartridge replacements</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button 
          onClick={handleContinue}
          className="w-full md:w-auto md:min-w-44 mx-auto bg-mywater-blue hover:bg-mywater-blue/90 flex items-center gap-2"
          size="lg"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="pt-8 text-center text-sm text-gray-500">
          <p>© 2024 MYWATER Technologies. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
