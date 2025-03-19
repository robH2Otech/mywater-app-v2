
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  onAddClick?: () => void;
  addButtonText?: string;
}

export function PageHeader({ title, description, onAddClick, addButtonText }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-gray-400">{description}</p>
      </div>
      {onAddClick && (
        <Button onClick={onAddClick} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          {addButtonText}
        </Button>
      )}
    </div>
  );
}
