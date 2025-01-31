import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Activity, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const timeData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

const pieData = [
  { name: "MYWATER 001", value: 91000 },
  { name: "MZWATER 000", value: 15000 },
];

const COLORS = ['#8884d8', '#82ca9d'];

export const Analytics = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [reportType, setReportType] = useState<string>("daily");

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase.from("units").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleDownload = () => {
    // TODO: Implement report download functionality
    console.log("Downloading report...");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <Button 
            onClick={handleDownload}
            className="bg-spotify-green hover:bg-spotify-green/90"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-spotify-darker border-spotify-accent">
            <h2 className="text-lg font-semibold mb-4 text-white">Select Unit</h2>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="bg-spotify-dark border-spotify-accent">
                <SelectValue placeholder="Select a unit..." />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-6 bg-spotify-darker border-spotify-accent">
            <h2 className="text-lg font-semibold mb-4 text-white">Report Type</h2>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-spotify-dark border-spotify-accent">
                <SelectValue placeholder="Select report type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-spotify-darker border-spotify-accent">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Volume Processed Over Time</h2>
              <Activity className="h-5 w-5 text-spotify-green" />
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeData}>
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

          <Card className="p-6 bg-spotify-darker border-spotify-accent">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Unit Usage Distribution</h2>
              <Activity className="h-5 w-5 text-spotify-green" />
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#282828",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};