
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  link?: string;
  iconColor?: string;
  subValue?: string;
}

export function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  link, 
  iconColor = "text-mywater-blue",
  subValue 
}: StatCardProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleClick = () => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <Card 
      className={`bg-spotify-darker border-spotify-accent hover:bg-spotify-accent/20 transition-colors ${
        link ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-mywater-blue/20 rounded-lg`}>
                {React.cloneElement(icon as React.ReactElement, {
                  className: `${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${iconColor}`
                })}
              </div>
              <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-gray-400 truncate`}>
                {title}
              </h3>
            </div>
            
            <div className="space-y-1">
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white truncate`}>
                {value}
              </p>
              
              {subtitle && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                  {subtitle}
                </p>
              )}
              
              {subValue && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-green-400`}>
                  {subValue}
                </p>
              )}
              
              {trend && (
                <div className="flex items-center gap-1">
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} ${
                    trend.isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                  </span>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                    vs last month
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
