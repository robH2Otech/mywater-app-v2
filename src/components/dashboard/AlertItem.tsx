
import React from 'react';
import { DashboardAlert } from '@/hooks/dashboard/useRecentAlerts';

interface AlertItemProps {
  alert: DashboardAlert;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
  return (
    <div 
      key={alert.id} 
      className={`p-4 rounded-lg ${
        alert.status === 'urgent' ? 'bg-red-500/20' : 'bg-yellow-500/20'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white">
            {alert.title}
          </h3>
          <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          alert.status === 'urgent' ? 'bg-red-500/30 text-red-200' : 'bg-yellow-500/30 text-yellow-200'
        }`}>
          {alert.type === 'request' ? 'Support Request' : alert.status}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {alert.created_at.toLocaleDateString()}
      </p>
    </div>
  );
};
