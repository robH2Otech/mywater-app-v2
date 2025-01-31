import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

export const Analytics = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>

        <Card className="p-6 glass">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Water Usage Over Time</h2>
            <Activity className="h-5 w-5 text-spotify-green" />
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1DB954" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#282828",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#1DB954"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Layout>
  );
};