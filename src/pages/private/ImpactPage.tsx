
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Waves, Recycle, Leaf, Coins, Award } from "lucide-react";
import { useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { useFirestoreUserData } from "@/hooks/dashboard/useFirestoreUserData";
import { useAuthState } from "@/hooks/firebase/useAuthState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export function ImpactPage() {
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  const [activeTab, setActiveTab] = useState("environmental");
  const [config, setConfig] = useState({
    bottleSize: 0.5,  // Default to 0.5L bottles
    bottleCost: 1.10, // Default to €1.10 per bottle
    userType: 'home' as 'home'  // Explicitly type as 'home'
  });
  
  const { user } = useAuthState();
  const { fetchUserData } = useFirestoreUserData();
  const [userName, setUserName] = useState<string>("");
  
  // Fetch user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        const userData = await fetchUserData(user.uid);
        if (userData) {
          setUserName(userData.first_name || '');
        }
      }
    };
    
    loadUserData();
  }, [user, fetchUserData]);
  
  const { 
    bottlesSaved, 
    waterSaved, 
    plasticSaved, 
    co2Saved, 
    moneySaved
  } = useImpactCalculations(period, config);

  // Format numbers
  const formatNumber = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });

  // Handle tab click
  const handleTabClick = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: "day" | "month" | "year" | "all-time") => {
    setPeriod(newPeriod);
  };

  return (
    <div className="container mx-auto max-w-5xl">
      {/* Main card with dark background */}
      <Card className="bg-black border-none p-6 rounded-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {userName ? `${userName}'s` : 'Your'} Impact Calculator
          </h2>
          <p className="text-gray-400 mt-1">
            See how MYWATER system helps you save
          </p>
        </div>

        {/* Tab navigation */}
        <div className="bg-black rounded-lg mb-6">
          <Tabs value={activeTab} onValueChange={handleTabClick} className="w-full">
            <TabsList className="grid grid-cols-4 w-full bg-zinc-900">
              <TabsTrigger 
                value="environmental" 
                className={`text-sm py-3 ${activeTab === "environmental" ? "bg-blue-600 text-white" : "text-gray-400"}`}
              >
                Environment
              </TabsTrigger>
              <TabsTrigger 
                value="financial" 
                className={`text-sm py-3 ${activeTab === "financial" ? "bg-blue-600 text-white" : "text-gray-400"}`}
              >
                Money
              </TabsTrigger>
              <TabsTrigger 
                value="co2" 
                className={`text-sm py-3 ${activeTab === "co2" ? "bg-blue-600 text-white" : "text-gray-400"}`}
              >
                CO2 Reduction
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className={`text-sm py-3 ${activeTab === "settings" ? "bg-blue-600 text-white" : "text-gray-400"}`}
              >
                My Settings
              </TabsTrigger>
            </TabsList>

            {/* Period toggle buttons */}
            <div className="flex justify-center my-4">
              <div className="inline-flex rounded-md bg-zinc-900 p-1">
                <Button
                  variant="ghost"
                  onClick={() => handlePeriodChange("day")}
                  className={`rounded-md px-4 py-1.5 text-sm ${
                    period === "day" ? "bg-blue-600 text-white" : "bg-transparent text-gray-400"
                  }`}
                >
                  Daily
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handlePeriodChange("month")}
                  className={`rounded-md px-4 py-1.5 text-sm ${
                    period === "month" ? "bg-blue-600 text-white" : "bg-transparent text-gray-400"
                  }`}
                >
                  Monthly
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handlePeriodChange("year")}
                  className={`rounded-md px-4 py-1.5 text-sm ${
                    period === "year" ? "bg-blue-600 text-white" : "bg-transparent text-gray-400"
                  }`}
                >
                  Yearly
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handlePeriodChange("all-time")}
                  className={`rounded-md px-4 py-1.5 text-sm ${
                    period === "all-time" ? "bg-blue-600 text-white" : "bg-transparent text-gray-400"
                  }`}
                >
                  All Time
                </Button>
              </div>
            </div>

            {/* Text information */}
            <div className="text-center mb-6">
              <p className="text-gray-400">Using MYWATER instead of plastic bottles has already saved:</p>
              <p className="text-xs text-gray-500 mt-1">Based on {config.bottleSize}L bottles at €{config.bottleCost?.toFixed(2)} each</p>
            </div>

            {/* Impact stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Bottles Saved */}
              <div className="bg-zinc-900 rounded-lg text-center p-4">
                <div className="flex justify-center mb-2">
                  <Waves className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-xl font-bold text-white">
                  {formatNumber(bottlesSaved)}
                </div>
                <div className="text-sm text-gray-400">Bottles Saved</div>
              </div>

              {/* Money Saved */}
              <div className="bg-zinc-900 rounded-lg text-center p-4">
                <div className="flex justify-center mb-2">
                  <Coins className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-xl font-bold text-white">
                  €{moneySaved.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-400">Money Saved</div>
              </div>

              {/* CO2 Reduced */}
              <div className="bg-zinc-900 rounded-lg text-center p-4">
                <div className="flex justify-center mb-2">
                  <Leaf className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-white">
                  {formatNumber(co2Saved)} kg
                </div>
                <div className="text-sm text-gray-400">CO₂ Reduced</div>
              </div>

              {/* Plastic Saved */}
              <div className="bg-zinc-900 rounded-lg text-center p-4">
                <div className="flex justify-center mb-2">
                  <Recycle className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-xl font-bold text-white">
                  {formatNumber(plasticSaved)} kg
                </div>
                <div className="text-sm text-gray-400">Plastic Saved</div>
              </div>
            </div>

            {/* Achievement badges */}
            <div className="flex justify-center flex-wrap gap-2 mt-6">
              {bottlesSaved >= 100 && (
                <div className="flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1 rounded-full">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">100+ Bottles</span>
                </div>
              )}
              {bottlesSaved >= 500 && (
                <div className="flex items-center bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">500+ Bottles</span>
                </div>
              )}
              {bottlesSaved >= 1000 && (
                <div className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">1000+ Bottles</span>
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
