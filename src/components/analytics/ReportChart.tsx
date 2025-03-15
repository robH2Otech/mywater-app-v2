
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from "@/components/ui/card";

interface ChartData {
  date: string;
  volume: number;
  avgVolume: number;
  avgTemperature: number;
  uvcHours: number;
}

interface ReportChartProps {
  data: ChartData[];
  title: string;
  type: 'volume' | 'temperature' | 'uvc';
}

export function ReportChart({ data, title, type }: ReportChartProps) {
  // Format date for display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));
  
  // Custom tooltip formatter for volume to show m³
  const volumeFormatter = (value: number) => `${value.toFixed(2)} m³`;
  
  return (
    <Card className="p-4 bg-spotify-darker border-spotify-accent">
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'volume' ? (
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" tickFormatter={volumeFormatter} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} 
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value.toFixed(2)} m³`, 'Volume']}
              />
              <Legend />
              <Bar dataKey="volume" name="Volume (m³)" fill="#4CAF50" />
            </BarChart>
          ) : type === 'temperature' ? (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} 
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value.toFixed(2)} °C`, 'Temperature']}
              />
              <Legend />
              <Line type="monotone" dataKey="avgTemperature" name="Temperature (°C)" stroke="#FF5722" />
            </LineChart>
          ) : (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} 
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value.toFixed(2)} hours`, 'UVC Hours']}
              />
              <Legend />
              <Line type="monotone" dataKey="uvcHours" name="UVC Hours" stroke="#2196F3" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
