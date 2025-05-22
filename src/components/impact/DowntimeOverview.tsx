
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Check, Clock, Loader2 } from "lucide-react";
import { useBusinessImpact } from "@/hooks/impact/useBusinessImpact";
import { Progress } from "@/components/ui/progress";
import { ImpactCard } from "../dashboard/private/impact/ImpactCard";
import { Skeleton } from "@/components/ui/skeleton";

interface DowntimeOverviewProps {
  period: "day" | "month" | "year" | "all-time";
}

export function DowntimeOverview({ period }: DowntimeOverviewProps) {
  const { isLoading, unitStatus, downtimeData } = useBusinessImpact(period);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const { operational, maintenance, offline, total } = unitStatus;
  const operationalPercentage = Math.round((operational / total) * 100);
  const maintenancePercentage = Math.round((maintenance / total) * 100);
  const offlinePercentage = Math.round((offline / total) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ImpactCard 
          title="Operational" 
          value={`${operational}/${total} units (${operationalPercentage}%)`} 
          icon={Check}
          iconColor="text-green-500"
        />
        
        <ImpactCard 
          title="Maintenance Required" 
          value={`${maintenance}/${total} units (${maintenancePercentage}%)`} 
          icon={Loader2}
          iconColor="text-amber-500"
        />
        
        <ImpactCard 
          title="Offline/Issues" 
          value={`${offline}/${total} units (${offlinePercentage}%)`} 
          icon={AlertTriangle}
          iconColor="text-red-500"
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Uptime Analysis</CardTitle>
          <CardDescription>
            System performance based on uptime across all units
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Uptime</span>
              <span className="font-medium">{unitStatus.uptime}%</span>
            </div>
            <Progress value={unitStatus.uptime} className="h-2" />
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Units Needing Attention</h4>
            <div className="space-y-3">
              {unitStatus.needsAttention.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {unit.status === 'maintenance' ? (
                      <Loader2 className="h-4 w-4 text-amber-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span>{unit.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {unit.lastActive}
                    </span>
                  </div>
                </div>
              ))}
              
              {unitStatus.needsAttention.length === 0 && (
                <div className="text-sm text-muted-foreground py-2">
                  All units are operational.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {downtimeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Downtime Incidents</CardTitle>
            <CardDescription>
              Recent issues affecting unit performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {downtimeData.map((incident, index) => (
                <div key={index} className="flex items-start justify-between pb-3 border-b last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-medium">{incident.unitName}</p>
                    <p className="text-sm text-muted-foreground">{incident.issue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{incident.duration}</p>
                    <p className="text-xs text-muted-foreground">{incident.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
