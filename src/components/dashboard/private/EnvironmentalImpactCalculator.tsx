
import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Droplet, 
  Leaf, 
  Package,
  Info,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  calculateDailyImpact, 
  calculateYearlyImpact, 
  formatEnvironmentalImpact,
  formatDecimal
} from "@/utils/measurements/formatUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";

// Environmental impact chart component
const ImpactChart = ({ dailyConsumption }: { dailyConsumption: number }) => {
  const yearlyImpact = calculateYearlyImpact(dailyConsumption);
  const monthlyImpact = {
    bottles: yearlyImpact.bottles / 12,
    co2: yearlyImpact.co2 / 12,
    plastic: yearlyImpact.plastic / 12
  };
  
  const chartData = [
    { 
      label: "Monthly",
      bottles: monthlyImpact.bottles,
      co2: monthlyImpact.co2,
      plastic: monthlyImpact.plastic
    },
    { 
      label: "Yearly",
      bottles: yearlyImpact.bottles,
      co2: yearlyImpact.co2,
      plastic: yearlyImpact.plastic
    }
  ];
  
  // Max values for scaling the chart (based on yearly impact)
  const maxBottles = yearlyImpact.bottles;
  const maxCO2 = yearlyImpact.co2;
  const maxPlastic = yearlyImpact.plastic;
  
  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-medium text-lg">Your Environmental Impact</h3>
      
      <div className="space-y-6">
        {chartData.map((data, index) => (
          <div key={index} className="space-y-3">
            <h4 className="text-sm font-medium text-gray-400">{data.label} Impact</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500 shrink-0" />
                <div className="w-full">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bottles Saved</span>
                    <span className="font-medium">{formatEnvironmentalImpact(data.bottles, 'bottles')}</span>
                  </div>
                  <Progress value={(data.bottles / maxBottles) * 100} className="h-2 bg-gray-700" />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500 shrink-0" />
                <div className="w-full">
                  <div className="flex justify-between text-sm mb-1">
                    <span>CO₂ Reduction</span>
                    <span className="font-medium">{formatEnvironmentalImpact(data.co2, 'kg CO₂')}</span>
                  </div>
                  <Progress value={(data.co2 / maxCO2) * 100} className="h-2 bg-gray-700" />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-yellow-500 shrink-0" />
                <div className="w-full">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Plastic Waste Reduced</span>
                    <span className="font-medium">{formatEnvironmentalImpact(data.plastic, 'kg plastic')}</span>
                  </div>
                  <Progress value={(data.plastic / maxPlastic) * 100} className="h-2 bg-gray-700" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Environmental comparison facts
const ComparisonFacts = ({ dailyConsumption }: { dailyConsumption: number }) => {
  const yearlyImpact = calculateYearlyImpact(dailyConsumption);

  // Calculate equivalent impacts for better visualization
  const equivalentTrees = Math.round(yearlyImpact.co2 / 20); // Rough estimate: 1 tree absorbs ~20kg CO2 per year
  const equivalentCarKm = Math.round(yearlyImpact.co2 * 8); // Rough estimate: 0.125kg CO2 per km in average car
  const bottleHeight = yearlyImpact.bottles * 0.25; // Assuming each bottle is ~25cm tall
  const bottleTowerHeight = bottleHeight >= 1000 ? 
    `${(bottleHeight / 1000).toFixed(1)}km` : 
    `${bottleHeight.toFixed(0)}m`;
  
  return (
    <div className="mt-6">
      <Collapsible>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Did You Know?</h3>
          <CollapsibleTrigger className="flex items-center text-sm text-blue-400 hover:text-blue-300">
            <span className="mr-1">See impact facts</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="space-y-3 mt-3 text-sm">
          <div className="p-3 rounded-md bg-green-900/20 border border-green-800/50">
            <p>Your yearly CO₂ reduction of {formatEnvironmentalImpact(yearlyImpact.co2, 'kg CO₂')} is equivalent to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The CO₂ absorbed by {equivalentTrees} trees in a year</li>
              <li>Not driving {equivalentCarKm} km in an average car</li>
            </ul>
          </div>
          
          <div className="p-3 rounded-md bg-blue-900/20 border border-blue-800/50">
            <p>The {Math.round(yearlyImpact.bottles)} plastic bottles you've saved this year:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Would create a tower {bottleTowerHeight} high if stacked</li>
              <li>Would cover a football field if laid side by side</li>
              <li>Take 450+ years to decompose in nature</li>
            </ul>
          </div>
          
          <div className="p-3 rounded-md bg-yellow-900/20 border border-yellow-800/50">
            <p>By reducing {formatEnvironmentalImpact(yearlyImpact.plastic, 'kg plastic')} of plastic waste:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>You're helping keep microplastics out of our oceans and food chain</li>
              <li>You're reducing dependence on petroleum-based products</li>
              <li>You're preventing plastic that would take centuries to decompose</li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Impact card component for displaying impact metrics
const ImpactCard = ({ 
  icon, 
  title, 
  value, 
  unit, 
  bgClass, 
  iconClass,
  description
}: { 
  icon: React.ReactNode;
  title: string;
  value: string | number;
  unit: string;
  bgClass: string;
  iconClass: string;
  description: string;
}) => {
  return (
    <div className={`p-3 sm:p-4 rounded-lg ${bgClass} flex flex-col items-center text-center h-full`}>
      <div className={`${iconClass} mb-2`}>{icon}</div>
      <h4 className="text-sm font-medium mb-1">{title}</h4>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  );
};

// Main calculator component
export function EnvironmentalImpactCalculator() {
  const [dailyConsumption, setDailyConsumption] = useState<number>(1.5); // Default 1.5L
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
  const dailyImpact = calculateDailyImpact(dailyConsumption);
  const yearlyImpact = calculateYearlyImpact(dailyConsumption);
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <Card className="p-4 sm:p-6 bg-spotify-darker">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="h-5 w-5 text-mywater-blue" />
        <h2 className="text-lg sm:text-xl font-semibold">Environmental Impact Calculator</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
            <label className="text-sm font-medium">
              How much water do you drink daily?
            </label>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-bold">{dailyConsumption.toFixed(1)}L</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 ml-1">
                    <Info className="h-4 w-4 text-gray-400" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2 text-sm">
                    <p>The recommended daily water intake is:</p>
                    <ul className="list-disc list-inside">
                      <li>2.7 liters (women)</li>
                      <li>3.7 liters (men)</li>
                    </ul>
                    <p className="text-xs text-gray-400">About 20% comes from food, the rest from drinks.</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">0.5L</span>
            <Slider 
              value={[dailyConsumption]} 
              onValueChange={values => setDailyConsumption(values[0])}
              min={0.5}
              max={5}
              step={0.1}
              className="flex-1"
            />
            <span className="text-sm">5L</span>
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 bottle</span>
            <span>10 bottles</span>
          </div>
        </div>

        {/* YEARLY IMPACT - Featured prominently at the top */}
        <div className="p-4 bg-gradient-to-r from-blue-900/30 to-green-900/30 rounded-lg border border-blue-800/30">
          <h3 className="text-center font-semibold mb-3 text-lg">Yearly Environmental Impact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <ImpactCard 
              icon={<Package className="h-6 w-6 sm:h-8 sm:w-8" />}
              title="Bottles Saved"
              value={formatEnvironmentalImpact(yearlyImpact.bottles, 'bottles')}
              unit="bottles"
              bgClass="bg-blue-900/20 border border-blue-800/30"
              iconClass="text-blue-500"
              description="0.5L plastic bottles"
            />
            
            <ImpactCard 
              icon={<Leaf className="h-6 w-6 sm:h-8 sm:w-8" />}
              title="CO₂ Reduction"
              value={formatEnvironmentalImpact(yearlyImpact.co2, 'kg CO₂')}
              unit="kg CO₂"
              bgClass="bg-green-900/20 border border-green-800/30"
              iconClass="text-green-500"
              description="kg of CO₂ emissions"
            />
            
            <ImpactCard 
              icon={<Droplet className="h-6 w-6 sm:h-8 sm:w-8" />}
              title="Plastic Waste Reduced"
              value={formatEnvironmentalImpact(yearlyImpact.plastic, 'kg plastic')}
              unit="kg plastic"
              bgClass="bg-yellow-900/20 border border-yellow-800/30"
              iconClass="text-yellow-500" 
              description="kilograms of plastic"
            />
          </div>
        </div>

        {/* DAILY IMPACT - Second section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ImpactCard 
            icon={<Package className="h-6 w-6 sm:h-8 sm:w-8" />}
            title="Bottles Saved Daily"
            value={Math.round(dailyImpact.bottles)}
            unit="bottles"
            bgClass="bg-blue-900/20 border border-blue-800/30"
            iconClass="text-blue-500"
            description="0.5L plastic bottles"
          />
          
          <ImpactCard 
            icon={<Leaf className="h-6 w-6 sm:h-8 sm:w-8" />}
            title="CO₂ Reduction Daily"
            value={dailyImpact.co2.toFixed(1)}
            unit="kg"
            bgClass="bg-green-900/20 border border-green-800/30"
            iconClass="text-green-500"
            description="kg of CO₂ emissions"
          />
          
          <ImpactCard 
            icon={<Droplet className="h-6 w-6 sm:h-8 sm:w-8" />}
            title="Plastic Waste Reduced"
            value={(dailyImpact.plastic * 1000).toFixed(0)}
            unit="g"
            bgClass="bg-yellow-900/20 border border-yellow-800/30"
            iconClass="text-yellow-500"
            description="grams daily"
          />
        </div>

        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={toggleDetails}
        >
          {showDetails ? (
            <>
              <span>Hide Detailed Impact</span>
              <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              <span>Show Detailed Impact</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {showDetails && (
          <>
            <ImpactChart dailyConsumption={dailyConsumption} />
            <ComparisonFacts dailyConsumption={dailyConsumption} />
          </>
        )}
        
        <Button 
          variant="default"
          className="w-full mt-4 bg-green-600 hover:bg-green-700"
          onClick={() => setDailyConsumption(prev => Math.min(prev + 0.5, 5))}
        >
          <Check className="mr-2 h-4 w-4" />
          Drink more, save more!
        </Button>
      </div>
    </Card>
  );
}
