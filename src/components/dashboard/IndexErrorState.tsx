
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface IndexErrorStateProps {
  company: string | null;
  userRole: string | null;
}

export const IndexErrorState = ({ company, userRole }: IndexErrorStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="p-6 max-w-md w-full bg-red-900/20 border-red-800">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <h2 className="text-lg font-semibold text-white">Data Loading Error</h2>
        </div>
        <p className="text-gray-300 mb-4">Failed to load units data</p>
        <p className="text-sm text-gray-400 mb-4">
          Company: {company || 'Not set'} | Role: {userRole || 'Not set'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Retry
        </button>
      </Card>
    </div>
  );
};
