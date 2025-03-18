
import { Card } from "@/components/ui/card";
import { AlertTriangle, AlertOctagon, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { MapPin } from "lucide-react";

interface AlertsListProps {
  units: any[];
  onAlertClick: (alert: any) => void;
}

export function AlertsList({ units, onAlertClick }: AlertsListProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'urgent':
        return {
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-200',
          borderColor: 'border-red-500/30',
          icon: <AlertOctagon className="h-5 w-5 text-red-500" />
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-200',
          borderColor: 'border-yellow-500/30',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
        };
      default:
        return {
          bgColor: 'bg-blue-500/20',
          textColor: 'text-blue-200',
          borderColor: 'border-blue-500/30',
          icon: <Bell className="h-5 w-5 text-blue-500" />
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {units.map((unit) => (
        unit.alerts.map((alert: any) => {
          const styles = getStatusStyles(alert.status);
          
          return (
            <Card 
              key={alert.id}
              className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors cursor-pointer relative group"
              onClick={() => onAlertClick(alert)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {styles.icon}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {unit.name}
                      </h3>
                      {unit.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                          <MapPin className="h-4 w-4" />
                          {unit.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAlertClick(alert);
                    }}
                  >
                    <Edit className="h-4 w-4 text-white" />
                  </Button>
                </div>

                <div className={`mt-4 p-3 rounded-lg ${styles.bgColor} ${styles.borderColor} border`}>
                  <p className="text-sm text-gray-200">{alert.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${styles.bgColor} ${styles.textColor}`}>
                      {alert.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.created_at || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      ))}
    </div>
  );
}
