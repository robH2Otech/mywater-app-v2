
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Droplets, TreePine, Bike } from "lucide-react";

export function ImpactPage() {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Environmental Impact</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-600/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-green-400" />
              Environmental Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              By using your MYWATER system, you're making a significant positive impact on the environment. Each refill means one less plastic bottle in our oceans and landfills.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-600/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-400" />
              Water Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Your MYWATER system ensures you have access to clean, filtered water while reducing plastic waste and your carbon footprint.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-600/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Every time you use your MYWATER system, you're contributing to a cleaner planet. Track your impact and earn achievements as you make a difference.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-600/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-purple-400" />
              Sustainable Living
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Join our community of environmentally conscious users who are making a difference one refill at a time. Together, we can create a more sustainable future.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
