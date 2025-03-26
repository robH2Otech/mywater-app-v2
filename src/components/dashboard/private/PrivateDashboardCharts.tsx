
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentData } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplet } from "lucide-react";

// Mock data for the water usage chart
const waterUsageData = [
  { name: 'Mon', usage: 30 },
  { name: 'Tue', usage: 45 },
  { name: 'Wed', usage: 60 },
  { name: 'Thu', usage: 40 },
  { name: 'Fri', usage: 35 },
  { name: 'Sat', usage: 25 },
  { name: 'Sun', usage: 20 },
];

interface PrivateDashboardChartsProps {
  userData: DocumentData | null;
}

export function PrivateDashboardCharts({ userData }: PrivateDashboardChartsProps) {
  return (
    <div className="lg:col-span-2">
      <Card className="bg-spotify-darker border-spotify-accent h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Droplet className="h-5 w-5 text-mywater-blue" />
            Water Usage
          </CardTitle>
          <div className="text-sm text-gray-400 px-3 py-1 rounded-full bg-spotify-dark">
            Last 7 Days
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={waterUsageData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#8E9196" />
                <YAxis
                  stroke="#8E9196"
                  label={{ 
                    value: 'Liters', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#8E9196' }
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F2C', 
                    borderColor: '#333',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#33C3F0' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#33C3F0" 
                  strokeWidth={3}
                  dot={{ stroke: '#33C3F0', strokeWidth: 2, r: 4, fill: '#1A1F2C' }}
                  activeDot={{ r: 6, fill: '#33C3F0' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
