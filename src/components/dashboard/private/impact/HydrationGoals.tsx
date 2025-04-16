
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Droplet, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { useToast } from "@/hooks/use-toast";

interface HydrationGoalsProps {
  waterConsumed: number; // in liters
  period: "week" | "month" | "year" | "all-time";
}

export function HydrationGoals({ waterConsumed, period }: HydrationGoalsProps) {
  const { toast } = useToast();
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  const [hydrationGoal, setHydrationGoal] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('hydrationGoal');
    return saved ? parseFloat(saved) : 1000; // Default 1000L if not set
  });
  const [goalInput, setGoalInput] = useState(hydrationGoal.toString());
  
  // Calculate normalization factor
  const normalizationFactor = period === "week" ? 7 : 
                              period === "month" ? 30 : 
                              period === "year" ? 365 : 730; // all-time ~2 years
  
  // Calculate progress as percentage
  const progress = Math.min((waterConsumed / hydrationGoal) * 100, 100);
  
  // Save goal to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('hydrationGoal', hydrationGoal.toString());
  }, [hydrationGoal]);
  
  const handleSaveGoal = () => {
    const newGoal = parseFloat(goalInput);
    if (isNaN(newGoal) || newGoal <= 0) {
      toast({
        title: "Invalid goal",
        description: "Please enter a valid number greater than zero",
        variant: "destructive"
      });
      return;
    }
    
    setHydrationGoal(newGoal);
    setIsSettingGoal(false);
    
    toast({
      title: "Goal updated",
      description: `Your hydration goal is now set to ${newGoal} liters`,
    });
  };
  
  return (
    <Card className="bg-spotify-accent/10 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center justify-between">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-mywater-blue mr-2" />
            Personal Hydration Goal
          </div>
          <Button 
            variant="ghost" 
            onClick={() => setIsSettingGoal(!isSettingGoal)}
            size="sm"
          >
            {isSettingGoal ? "Cancel" : "Set Goal"}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isSettingGoal ? (
          <div className="space-y-3">
            <FormInput
              label="Hydration Goal (Liters)"
              value={goalInput}
              onChange={setGoalInput}
              type="number"
              min="1"
            />
            <Button 
              onClick={handleSaveGoal}
              className="w-full bg-mywater-blue"
            >
              Save Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Droplet className="h-4 w-4 text-blue-400 mr-1" /> 
                Current Progress
              </span>
              <span>{Math.round(progress)}% of {hydrationGoal} liters</span>
            </div>
            
            <Progress value={progress} />
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>0L</span>
              <span>{hydrationGoal/2}L</span>
              <span>{hydrationGoal}L</span>
            </div>
            
            {progress >= 100 && (
              <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-mywater-blue p-2 rounded-md mt-2">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">Hydration goal achieved!</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
