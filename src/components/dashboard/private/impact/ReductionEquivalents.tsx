
import { Card, CardContent } from "@/components/ui/card";
import { Car, Smartphone, Tree, Recycle } from "lucide-react";

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
  const treesEquivalent = Math.round(co2Saved / 21); // 21kg CO2 absorbed by one tree per year
  const carKilometers = Math.round(co2Saved * 4); // 0.25kg CO2 per km driven
  const smartphoneCharges = Math.round(co2Saved * 220); // 0.0045kg CO2 per smartphone charge
  const recyclingEquivalent = Math.round(plasticSaved * 2.5); // 2.5x plastic weight in general recycling

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-400">
        Your environmental impact for {period === "day" ? "today" : 
          period === "month" ? "this month" : 
          period === "year" ? "this year" : "all time"} is equivalent to:
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-green-900/20 border-green-600/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-800/30 flex items-center justify-center">
              <Tree className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Trees Working For</p>
              <p className="text-lg font-medium">{treesEquivalent} {treesEquivalent === 1 ? 'tree' : 'trees'}</p>
              <p className="text-xs text-gray-500">for one year</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-600/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-800/30 flex items-center justify-center">
              <Car className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Car Kilometers</p>
              <p className="text-lg font-medium">{carKilometers} km</p>
              <p className="text-xs text-gray-500">not driven</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-900/20 border-purple-600/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-800/30 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Smartphone Charges</p>
              <p className="text-lg font-medium">{smartphoneCharges}</p>
              <p className="text-xs text-gray-500">charges saved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-900/20 border-amber-600/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-800/30 flex items-center justify-center">
              <Recycle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Recycling Impact</p>
              <p className="text-lg font-medium">{recyclingEquivalent} kg</p>
              <p className="text-xs text-gray-500">of waste recycled</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-blue-900/30 to-green-900/30 rounded-lg text-center">
        <h3 className="font-medium mb-1">Your Total Impact</h3>
        <p className="text-sm">
          By saving {bottlesSaved.toFixed(1)} plastic bottles, you've reduced CO₂ emissions by {co2Saved.toFixed(1)} kg
          and prevented {plasticSaved.toFixed(1)} kg of plastic waste!
        </p>
      </div>
    </div>
  );
}
