
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  onAddClick?: () => void;
  addButtonText?: string;
  showAddButton?: boolean; // Add this prop to make it optional
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  onAddClick, 
  addButtonText,
  showAddButton = true // Default to true for backward compatibility
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-8 w-8 text-primary" />}
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {description && <p className="text-gray-400">{description}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
        {onAddClick && showAddButton && (
          <Button onClick={onAddClick} className="bg-mywater-blue hover:bg-mywater-blue/90">
            <Plus className="h-4 w-4 mr-2" />
            {addButtonText || "Add"}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
