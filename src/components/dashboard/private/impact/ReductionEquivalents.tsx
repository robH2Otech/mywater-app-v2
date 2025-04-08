
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Car, Smartphone, Tree } from "lucide-react";

interface ReductionEquivalentsProps {
  co2Saved: number;
  plasticSaved: number;
  bottlesSaved: number;
  period: "day" | "month" | "year" | "all-time";
}

export function ReductionEquivalents({ 
  co2Saved,
  plasticSaved,
  bottlesSaved,
  period
}: ReductionEquivalentsProps) {
  // Calculate equivalents
  const carMiles = Math.round(co2Saved * 4); // ~4 miles per kg of CO2
  const treesPlanted = Math.round(co2Saved / 20); // ~20kg CO2 per tree per year
  const smartphoneCharges = Math.round(co2Saved * 60); // ~60 charges per kg of CO2
  const showerMinutes = Math.round(plasticSaved * 8); // ~8 minutes per kg of plastic

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-center mb-4">
        Your Environmental Impact Equivalents
      </h3>
      
      <p className="text-sm text-center text-gray-400 mb-4">
        See how your plastic reduction translates to real-world impact
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Car Miles Equivalent */}
        <Card className="bg-spotify-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <Car className="h-5 w-5 text-blue-400 mr-2" />
              Car Miles Not Driven
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{carMiles}</p>
            <p className="text-sm text-gray-400">miles</p>
          </CardContent>
        </Card>
        
        {/* Trees Planted */}
        <Card className="bg-spotify-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <Tree className="h-5 w-5 text-green-400 mr-2" />
              Trees Planted Equivalent
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{treesPlanted}</p>
            <p className="text-sm text-gray-400">trees</p>
          </CardContent>
        </Card>
        
        {/* Smartphone Charges */}
        <Card className="bg-spotify-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <Smartphone className="h-5 w-5 text-amber-400 mr-2" />
              Smartphone Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{smartphoneCharges}</p>
            <p className="text-sm text-gray-400">charges</p>
          </CardContent>
        </Card>
        
        {/* Shower Minutes Saved */}
        <Card className="bg-spotify-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <Leaf className="h-5 w-5 text-emerald-400 mr-2" />
              CO₂ Absorption Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{treesPlanted * 365}</p>
            <p className="text-sm text-gray-400">days of tree growth</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center text-xs text-gray-500 mt-4">
        <p>Equivalents are estimated based on industry standards and research data.</p>
        <p>Keep using MYWATER to increase your positive environmental impact!</p>
      </div>
    </div>
  );
}
