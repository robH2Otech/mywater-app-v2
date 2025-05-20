
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare } from "lucide-react";
import { addFieldComment } from "@/services/comments/fieldComments";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "@/integrations/firebase/client";

interface FieldCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  entityType: "alert" | "filter" | "unit";
}

export function FieldCommentDialog({
  open,
  onOpenChange,
  entityId,
  entityType
}: FieldCommentDialogProps) {
  const [comment, setComment] = useState("");
  const [isFieldVerified, setIsFieldVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = auth.currentUser;

  const handleSubmit = async () => {
    if (!comment.trim() || !currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      await addFieldComment({
        content: comment.trim(),
        entity_id: entityId,
        entity_type: entityType,
        field_verified: isFieldVerified
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: [`${entityType}-comments-${entityId}`] 
      });
      
      // Also invalidate parent entities to update comment counts
      if (entityType === "alert") {
        queryClient.invalidateQueries({ queryKey: ["alerts"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-recent-alerts"] });
      } else if (entityType === "filter") {
        queryClient.invalidateQueries({ queryKey: ["filter-units"] });
      } else if (entityType === "unit") {
        queryClient.invalidateQueries({ queryKey: ["units"] });
      }
      
      toast({
        title: "Comment added",
        description: "Your field observation has been recorded",
      });
      
      // Reset form and close dialog
      setComment("");
      setIsFieldVerified(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding field comment:", error);
      toast({
        title: "Error",
        description: "Failed to add field comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Add Field Observation
          </DialogTitle>
        </DialogHeader>

        <ScrollableDialogContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-200 mb-1">
                Observation Details
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your field observation or comment..."
                className="min-h-[120px] bg-spotify-dark border-spotify-accent text-white"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="field-verified" 
                checked={isFieldVerified}
                onCheckedChange={(checked) => setIsFieldVerified(!!checked)}
              />
              <label 
                htmlFor="field-verified" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-200"
              >
                Verified on-site (marks this as a field-verified observation)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="bg-spotify-accent hover:bg-spotify-accent-hover text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!comment.trim() || isSubmitting}
              className="bg-mywater-blue hover:bg-mywater-blue/90 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Observation"}
            </Button>
          </div>
        </ScrollableDialogContent>
      </DialogContent>
    </Dialog>
  );
}
