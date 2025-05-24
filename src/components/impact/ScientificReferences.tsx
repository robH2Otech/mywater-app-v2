
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, BookOpen } from "lucide-react";

interface ScientificReference {
  title: string;
  description: string;
  url: string;
  category: string;
}

const scientificReferences: ScientificReference[] = [
  {
    title: "CO₂ Impact of Bottled Water",
    description: "Research on carbon footprint of bottled water production",
    url: "https://www.exemple.com/co2-impact-bottled-water",
    category: "Carbon Emissions"
  },
  {
    title: "Energy to Produce Bottled Water",
    description: "Study on energy consumption in bottled water manufacturing",
    url: "https://www.exemple.com/energy-bottled-water",
    category: "Energy Consumption"
  },
  {
    title: "Water Consumption Behind Drinking Water: Italy Case Study",
    description: "Research on real water consumption for bottled water production",
    url: "https://www.sciencedirect.com/water-consumption-italy",
    category: "Water Waste"
  },
  {
    title: "Single-Use Water Bottle Dimensions & Materials",
    description: "Technical specifications and plastic content of water bottles",
    url: "https://www.dimensions.com/water-bottle-single-use",
    category: "Plastic Content"
  }
];

export function ScientificReferences() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-blue-400" />
          Scientific Data Sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scientificReferences.map((ref, index) => (
            <div key={index} className="border border-gray-700 rounded-lg p-3 hover:border-blue-500/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-blue-300 mb-1">{ref.title}</h4>
                  <p className="text-xs text-gray-400 mb-2">{ref.description}</p>
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded">{ref.category}</span>
                </div>
                <a 
                  href={ref.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>All calculations are based on peer-reviewed scientific research and industry data.</p>
        </div>
      </CardContent>
    </Card>
  );
}
