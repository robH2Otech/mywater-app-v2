
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AlertOctagon } from "lucide-react";
import { Link } from "react-router-dom";

interface Alert {
  id: string;
  unit_id: string;
  message: string;
  created_at: string;
  status: string;
}

const Index = () => {
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      console.log("Fetching urgent alerts...");
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("status", "urgent")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching alerts:", error);
        throw error;
      }
      console.log("Urgent alerts data:", data);
      return data as Alert[];
    },
  });

  return (
    <div className="min-h-screen p-6 bg-spotify-black">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Urgent Changes Required</h2>
            <Link to="/alerts" className="text-sm text-spotify-green hover:text-spotify-green/80">
              View All Alerts →
            </Link>
          </div>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-lg bg-spotify-accent/30 flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Alert #{alert.id.slice(0, 8)}</h3>
                  <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-400">No urgent changes required</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
