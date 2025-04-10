
import { EnvironmentalImpactCalculator } from "@/components/dashboard/private/EnvironmentalImpactCalculator";

export function ImpactPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Impact Calculator</h2>
      <EnvironmentalImpactCalculator />
    </div>
  );
}
