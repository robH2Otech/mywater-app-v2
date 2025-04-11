
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImpactCard } from "@/components/dashboard/private/impact/ImpactCard";
import { Waves, Recycle, Leaf, Coins, Award } from "lucide-react";
import { TabContentItem } from "@/components/dashboard/private/TabContentItem";
import { MoneySavingsCalculator } from "@/components/dashboard/private/impact/MoneySavingsCalculator";
import { ReductionEquivalents } from "@/components/dashboard/private/impact/ReductionEquivalents";
import { ImpactPeriodToggle } from "@/components/dashboard/private/impact/ImpactPeriodToggle";
import { ImpactSettings } from "@/components/dashboard/private/impact/ImpactSettings";
import { useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { useAuthState } from "@/hooks/firebase/useAuthState";
import { useFirestoreUserData } from "@/hooks/dashboard/useFirestoreUserData";
import { useEffect } from "react";

export function ImpactPage() {
  // State for managing tabs and impact calculation configurations
  const [activeTab, setActiveTab] = useState("environmental");
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  const [config, setConfig] = useState({
    bottleSize: 0.5,  // Default to 0.5L bottles
    bottleCost: 1.10, // Default to €1.10 per bottle
    userType: 'home' as const
  });
  
  // Auth and user data
  const { user } = useAuthState();
  const { fetchUserData } = useFirestoreUserData();
  const [userName, setUserName] = useState<string>("");
  
  // Impact calculations
  const { 
    bottlesSaved, 
    waterSaved, 
    plasticSaved, 
    co2Saved, 
    moneySaved
  } = useImpactCalculations(period, config);
  
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
  
  // Format numbers with proper decimal places
  const formatBottles = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  const formatMoney = (value: number) => `€${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const formatWeight = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  
  // Handle configuration changes
  const handleConfigChange = (newConfig: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6 bg-spotify-darker border-spotify-accent overflow-hidden">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold">
              {userName ? `${userName}'s` : 'Your'} Impact Calculator
            </h2>
            <p className="text-gray-400 mt-1 text-sm md:text-base">
              See how MYWATER system helps you save the environment and money
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-4">
              <TabsList className="bg-spotify-dark">
                <TabsTrigger value="environmental" className="data-[state=active]:bg-green-700/50">
                  <Leaf className="h-4 w-4 mr-1.5" />
                  Environment
                </TabsTrigger>
                <TabsTrigger value="money" className="data-[state=active]:bg-amber-700/50">
                  <Coins className="h-4 w-4 mr-1.5" />
                  Money
                </TabsTrigger>
                <TabsTrigger value="co2" className="data-[state=active]:bg-blue-700/50">
                  <Recycle className="h-4 w-4 mr-1.5" />
                  CO₂ Emissions
                </TabsTrigger>
                <TabsTrigger value="plastic" className="data-[state=active]:bg-emerald-700/50">
                  <Waves className="h-4 w-4 mr-1.5" />
                  Plastic Reduction
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Environmental Impact Tab Content */}
            <TabContentItem value="environmental">
              <div className="space-y-6">
                {/* Period Toggle */}
                <ImpactPeriodToggle 
                  period={period} 
                  setPeriod={setPeriod} 
                  includeAllTime={true} 
                />
                
                <div className="text-center mb-2">
                  <p className="text-gray-300">Using MYWATER instead of plastic bottles has already saved:</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Based on {config.bottleSize}L bottles at €{config.bottleCost?.toFixed(2)} each
                  </p>
                </div>
                
                {/* Impact Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ImpactCard
                    title="Bottles Saved"
                    value={formatBottles(bottlesSaved)}
                    icon={Waves}
                    className="bg-blue-900/20 border-blue-600/20"
                    iconColor="text-blue-400"
                  />
                  <ImpactCard
                    title="Money Saved"
                    value={formatMoney(moneySaved)}
                    icon={Coins}
                    className="bg-amber-900/20 border-amber-600/20"
                    iconColor="text-amber-400"
                  />
                  <ImpactCard
                    title="CO₂ Reduced"
                    value={`${formatWeight(co2Saved)} kg`}
                    icon={Leaf}
                    className="bg-emerald-900/20 border-emerald-600/20"
                    iconColor="text-emerald-400"
                  />
                  <ImpactCard
                    title="Plastic Saved"
                    value={`${formatWeight(plasticSaved)} kg`}
                    icon={Recycle}
                    className="bg-green-900/20 border-green-600/20"
                    iconColor="text-green-400"
                  />
                </div>

                {/* Achievement Badges */}
                <div className="flex justify-center flex-wrap gap-3 mt-4">
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
                
                {/* Environmental Equivalents */}
                <ReductionEquivalents
                  co2Saved={co2Saved}
                  plasticSaved={plasticSaved}
                  bottlesSaved={bottlesSaved}
                  period={period}
                />
              </div>
            </TabContentItem>
            
            {/* Money Saving Calculator Tab Content */}
            <TabContentItem value="money">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Money Savings Calculator</h3>
                  <p className="text-sm text-gray-400">
                    See how much money you save by using MYWATER
                  </p>
                </div>
                
                <MoneySavingsCalculator 
                  baseBottlePrice={config.bottleCost}
                  baseBottleSize={config.bottleSize}
                  baseDailyConsumption={2}
                />
                
                <Card className="bg-gradient-to-br from-amber-900/30 to-amber-700/20 p-4 border-amber-600/30">
                  <CardContent className="p-0 space-y-3">
                    <h3 className="text-center text-amber-300 font-medium">Return on Investment</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-400">Payback Period</p>
                        <p className="text-xl font-bold text-amber-300">~9 months</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">5-Year Savings</p>
                        <p className="text-xl font-bold text-amber-300">€1,700+</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Monthly Savings</p>
                        <p className="text-xl font-bold text-amber-300">€28+</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabContentItem>
            
            {/* CO2 Emissions Tab Content */}
            <TabContentItem value="co2">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">CO₂ Emissions Reduction</h3>
                  <p className="text-sm text-gray-400">
                    Track your contribution to reducing carbon emissions
                  </p>
                </div>
                
                {/* Period Toggle */}
                <ImpactPeriodToggle 
                  period={period} 
                  setPeriod={setPeriod} 
                  includeAllTime={true} 
                />
                
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-blue-300">{formatWeight(co2Saved)} kg</h3>
                    <p className="text-gray-400">CO₂ emissions prevented</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Production</span>
                      <span className="text-sm font-medium">{formatWeight(co2Saved * 0.6)} kg</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transport</span>
                      <span className="text-sm font-medium">{formatWeight(co2Saved * 0.3)} kg</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Disposal</span>
                      <span className="text-sm font-medium">{formatWeight(co2Saved * 0.1)} kg</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "10%" }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-spotify-dark p-4 rounded-lg">
                  <h4 className="font-medium mb-2">CO₂ Emissions Comparison</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-gray-700 rounded-lg text-center">
                      <p className="text-xs text-gray-400">MYWATER (1L)</p>
                      <p className="text-lg font-bold text-green-400">0.003 kg</p>
                      <p className="text-xs text-gray-500">CO₂ emissions</p>
                    </div>
                    
                    <div className="p-3 border border-gray-700 rounded-lg text-center">
                      <p className="text-xs text-gray-400">Bottled Water (1L)</p>
                      <p className="text-lg font-bold text-red-400">0.321 kg</p>
                      <p className="text-xs text-gray-500">CO₂ emissions</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-center mt-3 text-gray-400">
                    MYWATER reduces CO₂ emissions by over 99% compared to bottled water
                  </p>
                </div>
              </div>
            </TabContentItem>
            
            {/* Plastic Reduction Tab Content */}
            <TabContentItem value="plastic">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Plastic Waste Reduction</h3>
                  <p className="text-sm text-gray-400">
                    See how much plastic waste you've prevented
                  </p>
                </div>
                
                {/* Period Toggle */}
                <ImpactPeriodToggle 
                  period={period} 
                  setPeriod={setPeriod} 
                  includeAllTime={true} 
                />
                
                <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/20">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-green-300">{formatWeight(plasticSaved)} kg</h3>
                    <p className="text-gray-400">Plastic waste prevented</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatBottles(bottlesSaved)}</p>
                      <p className="text-xs text-gray-400">Plastic bottles</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatWeight(plasticSaved * 20)} g</p>
                      <p className="text-xs text-gray-400">Plastic per bottle</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Equivalent to recycling:</p>
                    <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
                      <li>{Math.round(plasticSaved * 25)} plastic bags</li>
                      <li>{Math.round(plasticSaved * 4)} plastic food containers</li>
                      <li>{Math.round(plasticSaved / 0.025)} plastic straws</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-spotify-dark p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Plastic Degradation Time</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Plastic Bottle</span>
                        <span className="text-sm font-medium">450 years</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "90%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Plastic Bag</span>
                        <span className="text-sm font-medium">20 years</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "40%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">MYWATER Filter</span>
                        <span className="text-sm font-medium">5 years</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "10%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-center mt-3 text-gray-400">
                    MYWATER filters are partially biodegradable and recyclable
                  </p>
                </div>
              </div>
            </TabContentItem>
          </Tabs>
          
          {/* Settings Section - Always visible */}
          <div className="mt-6">
            <ImpactSettings 
              currentConfig={config}
              onConfigChange={handleConfigChange}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
