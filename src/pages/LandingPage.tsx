
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Droplet, Shield, Users, Globe, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import MatrixRain from "@/components/ui/matrix-rain";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>("private");
  const { language, setLanguage, t } = useLanguage();
  const { firebaseUser, userRole } = useAuth();
  
  // Set default language to English when the component mounts
  useEffect(() => {
    setLanguage('en');
  }, []);

  const handleContinue = () => {
    if (selectedOption === "business") {
      navigate("/auth");
    } else {
      navigate("/private-auth");
    }
  };

  // Debug function to go directly to dashboard for testing
  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-spotify-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain 
        fontSize={16}
        color="#39afcd"
        characters="100X-WATER"
        fadeOpacity={0.05}
        speed={0.8}
      />
      
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-spotify-dark via-spotify-dark/90 to-spotify-dark/70 z-0"></div>

      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-2 bg-spotify-darker/80 p-2 rounded-md">
          <Globe className="h-4 w-4 text-gray-400" />
          <div className="flex space-x-1">
            <button 
              className={`px-2 py-1 rounded text-sm ${language === 'en' ? 'bg-mywater-blue text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button 
              className={`px-2 py-1 rounded text-sm ${language === 'sl' ? 'bg-mywater-blue text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setLanguage('sl')}
            >
              SL
            </button>
          </div>
        </div>
      </div>

      {/* Debug Panel for Authenticated Users */}
      {firebaseUser && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-green-900/80 border border-green-700 p-3 rounded-md">
            <p className="text-green-300 text-sm mb-2">
              ✅ Authenticated as: {firebaseUser.email}
            </p>
            <p className="text-green-300 text-sm mb-3">
              Role: {userRole || 'Loading...'}
            </p>
            <Button 
              onClick={goToDashboard}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-3xl w-full space-y-8 z-10">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            {t("welcome_to")} <span className="text-mywater-blue">X-WATER app</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t("app_subtitle")}
          </p>
        </div>

        {/* Option Cards */}
        <Tabs defaultValue="private" className="w-full" onValueChange={setSelectedOption}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="private">{t("private_user")}</TabsTrigger>
            <TabsTrigger value="business">{t("business_client")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="private" className="space-y-4">
            <Card className="glass transition-all hover:border-mywater-blue/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-mywater-blue" />
                  {t("home_water_purification")}
                </CardTitle>
                <CardDescription>
                  {t("home_user_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-mywater-blue shrink-0 mt-0.5" />
                    <span>{t("track_maintenance")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-mywater-blue shrink-0 mt-0.5" />
                    <span>{t("refer_friends")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-mywater-blue shrink-0 mt-0.5" />
                    <span>{t("environmental_impact")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="business" className="space-y-4">
            <Card className="glass transition-all hover:border-mywater-blue/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-mywater-blue" />
                  {t("business_water_management")}
                </CardTitle>
                <CardDescription>
                  {t("business_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-mywater-blue shrink-0 mt-0.5" />
                    <span>{t("monitor_units")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-mywater-blue shrink-0 mt-0.5" />
                    <span>{t("advanced_analytics")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-mywater-blue shrink-0 mt-0.5" />
                    <span>{t("technical_support")}</span>
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
          {t("continue")}
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="pt-8 text-center text-sm text-gray-500">
          <p>© 2025 X-WATER. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
