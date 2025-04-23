
import { ReactNode } from "react";

interface ChartContainerProps {
  children: ReactNode;
  height?: string | number;
}

export const ChartContainer = ({ 
  children, 
  height = "300px" 
}: ChartContainerProps) => {
  return (
    <div className="h-[300px]">
      {children}
    </div>
  );
};
