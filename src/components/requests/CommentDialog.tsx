
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SupportRequest {
  id: string;
  user_name: string;
  user_email: string;
  status: string;
}

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: SupportRequest | null;
  onSaveComment: (comment: string, author: string, assignedTo: string) => Promise<void>;
}

export function CommentDialog({ 
  open, 
  onOpenChange, 
  selectedRequest, 
  onSaveComment 
}: CommentDialogProps) {
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [assignedTechnician, setAssignedTechnician] = useState("");
  
  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    await onSaveComment(newComment, commentAuthor || "Admin", assignedTechnician);
    
    // Reset form
    setNewComment("");
    setCommentAuthor("");
    setAssignedTechnician("");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle>
            {selectedRequest?.status === "in_progress" 
              ? "Add Comment" 
              : "Mark as In Progress"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <FormInput
            label="Your Name"
            value={commentAuthor}
            onChange={setCommentAuthor}
            placeholder="Enter your name"
          />
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Assign to Technician</label>
            <Select value={assignedTechnician} onValueChange={setAssignedTechnician}>
              <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
                <SelectValue placeholder="Select a technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="John Smith">John Smith</SelectItem>
                <SelectItem value="Emma Johnson">Emma Johnson</SelectItem>
                <SelectItem value="Michael Davis">Michael Davis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Comment</label>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your comments or instructions here..."
              className="bg-spotify-accent border-spotify-accent-hover text-white min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!newComment.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
