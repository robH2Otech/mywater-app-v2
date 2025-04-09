
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Car, Smartphone, TrainFront } from "lucide-react";

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
  // ~6.5 kilometers per kg of CO2 (converted from miles to km)
  const carKilometers = Math.round(co2Saved * 6.5); 
  const treesPlanted = Math.round(co2Saved / 20); // ~20kg CO2 per tree per year
  const smartphoneCharges = Math.round(co2Saved * 60); // ~60 charges per kg of CO2
  const trainKilometers = Math.round(co2Saved * 15); // ~15km train ride per kg of CO2 saved

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-center mb-3">
        Your Environmental Impact Equivalents
      </h3>
      
      <p className="text-sm text-center text-gray-400 mb-3">
        See how your plastic reduction translates to real-world impact
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Car Kilometers Equivalent */}
        <Card className="bg-spotify-accent/10">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-sm flex items-center">
              <Car className="h-4 w-4 text-blue-400 mr-1.5" />
              Car Kilometers Not Driven
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-3">
            <p className="text-2xl font-bold">{carKilometers}</p>
            <p className="text-xs text-gray-400">kilometers</p>
          </CardContent>
        </Card>
        
        {/* Trees Planted */}
        <Card className="bg-spotify-accent/10">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-sm flex items-center">
              <Leaf className="h-4 w-4 text-green-400 mr-1.5" />
              Trees Planted Equivalent
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-3">
            <p className="text-2xl font-bold">{treesPlanted}</p>
            <p className="text-xs text-gray-400">trees</p>
          </CardContent>
        </Card>
        
        {/* Smartphone Charges */}
        <Card className="bg-spotify-accent/10">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-sm flex items-center">
              <Smartphone className="h-4 w-4 text-amber-400 mr-1.5" />
              Smartphone Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-3">
            <p className="text-2xl font-bold">{smartphoneCharges}</p>
            <p className="text-xs text-gray-400">charges</p>
          </CardContent>
        </Card>
        
        {/* Train Ride */}
        <Card className="bg-spotify-accent/10">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-sm flex items-center">
              <TrainFront className="h-4 w-4 text-emerald-400 mr-1.5" />
              Train Ride
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-3">
            <p className="text-2xl font-bold">{trainKilometers}</p>
            <p className="text-xs text-gray-400">kilometers</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center text-xs text-gray-500 mt-2">
        <p>Equivalents are estimated based on industry standards and research data.</p>
      </div>
    </div>
  );
}
