import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

const metrics = [
  { title: "Total Units", value: "156", change: "+12%" },
  { title: "Active Alerts", value: "3", change: "-2" },
  { title: "Water Usage", value: "2.4K", unit: "Gallons" },
  { title: "Efficiency", value: "94", unit: "%" },
];

export const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="p-4 glass">
            <h3 className="text-sm text-gray-400">{metric.title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metric.value}</span>
              {metric.unit && <span className="text-sm text-gray-400">{metric.unit}</span>}
              {metric.change && (
                <span className={`text-sm ${metric.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                  {metric.change}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 glass">
        <h2 className="text-lg font-semibold mb-4">Water Usage Trends</h2>
        <div className="h-[300px]">
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
  );
};