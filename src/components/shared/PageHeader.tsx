
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ComponentType, ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  onAddClick?: () => void;
  addButtonText?: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export function PageHeader({ title, description, onAddClick, addButtonText, icon: Icon }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-6 w-6 text-mywater-blue" />}
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
      {onAddClick && (
        <Button onClick={onAddClick} className="bg-mywater-blue hover:bg-mywater-blue/90">
          <Plus className="h-4 w-4 mr-2" />
          {addButtonText}
        </Button>
      )}
    </div>
  );
}
