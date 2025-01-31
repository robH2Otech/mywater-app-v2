import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Droplet, Bell, Calendar, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

interface Unit {
  id: string;
  name: string;
  status: string;
}

export const Dashboard = () => {
  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase.from("units").select("*");
      if (error) throw error;
      return data as Unit[];
    },
  });

  const activeUnits = units.filter(unit => unit.status === "active").length;
  const warningUnits = units.filter(unit => unit.status === "warning").length;
  const errorUnits = units.filter(unit => unit.status === "error").length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your water management overview.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/units">
          <Card className="p-6 glass hover:bg-spotify-accent/40 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Total Units</p>
                <p className="text-3xl font-bold mt-2">{units.length}</p>
              </div>
              <Droplet className="h-5 w-5 text-spotify-green" />
            </div>
          </Card>
        </Link>

        <Link to="/filters">
          <Card className="p-6 glass hover:bg-spotify-accent/40 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Filter Changes Required</p>
                <p className="text-3xl font-bold mt-2">{warningUnits}</p>
              </div>
              <Calendar className="h-5 w-5 text-yellow-500" />
            </div>
          </Card>
        </Link>

        <Link to="/alerts">
          <Card className="p-6 glass hover:bg-spotify-accent/40 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Active Alerts</p>
                <p className="text-3xl font-bold mt-2">{errorUnits}</p>
              </div>
              <Bell className="h-5 w-5 text-red-500" />
            </div>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card className="p-6 glass hover:bg-spotify-accent/40 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Total Volume Today</p>
                <p className="text-3xl font-bold mt-2">106.0 m³</p>
                <p className="text-sm text-spotify-green mt-1">↑ 13.2%</p>
              </div>
              <Activity className="h-5 w-5 text-spotify-green" />
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 glass lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Water Usage</h2>
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

        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Alerts</h2>
            <Bell className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-4">
            {units
              .filter(unit => unit.status === "error")
              .map(unit => (
                <div key={unit.id} className="p-4 rounded-lg bg-spotify-accent/30">
                  <h3 className="font-semibold">{unit.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Filter change needed soon. Please prepare new filter.
                  </p>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};