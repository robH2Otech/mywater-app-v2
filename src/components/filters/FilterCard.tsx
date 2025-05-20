
import React from "react";
import { Card } from "@/components/ui/card";
import { Filter, AlertTriangle, MapPin, Calendar, Edit } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TechnicianAndAbove } from "@/components/shared/RoleBasedAccess";
import { CommentCountBadge } from "@/components/comments/CommentCountBadge";

interface FilterCardProps {
  unit: any;
  onEditClick?: (e: React.MouseEvent, unit: any) => void;
  onClick?: () => void;
}

export function FilterCard({ unit, onEditClick, onClick }: FilterCardProps) {
  const getBgColor = (status: string) => {
    switch (status) {
      case "urgent":
        return "bg-red-500/20";
      case "warning":
        return "bg-yellow-500/20";
      default:
        return "bg-green-500/20";
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case "urgent":
        return "text-red-300";
      case "warning":
        return "text-yellow-300";
      default:
        return "text-green-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "urgent":
        return "Replace Now";
      case "warning":
        return "Replace Soon";
      default:
        return "Good Condition";
    }
  };

  return (
    <Card 
      className={`${getBgColor(unit.status)} hover:bg-opacity-30 transition-all duration-300 cursor-pointer overflow-hidden`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-3 ${getBgColor(unit.status)}`}>
              <Filter className={`h-5 w-5 ${getTextColor(unit.status)}`} />
            </div>
            <div>
              <h3 className="text-white font-semibold truncate">{unit.name}</h3>
              <div className="flex items-center text-sm text-gray-400">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{unit.location || "No location"}</span>
              </div>
            </div>
          </div>

          <TechnicianAndAbove>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white/10"
              onClick={onEditClick ? (e) => onEditClick(e, unit) : undefined}
            >
              <Edit className="h-4 w-4 text-gray-400" />
              <span className="sr-only">Edit</span>
            </Button>
          </TechnicianAndAbove>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center">
            <Badge className={`${getBgColor(unit.status)} ${getTextColor(unit.status)}`}>
              {getStatusText(unit.status)}
            </Badge>
            
            <CommentCountBadge entityId={unit.id} entityType="filter" className="ml-2" />
          </div>

          {unit.next_maintenance && (
            <div className="text-xs text-gray-400 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                {format(
                  new Date(unit.next_maintenance),
                  "MMM d, yyyy"
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
