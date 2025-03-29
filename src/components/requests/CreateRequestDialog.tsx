
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2 } from "lucide-react";

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: RequestFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface RequestFormData {
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  support_type: string;
  purifier_model: string;
}

export function CreateRequestDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  isSubmitting
}: CreateRequestDialogProps) {
  const [formData, setFormData] = useState<RequestFormData>({
    user_name: "",
    user_email: "",
    subject: "",
    message: "",
    support_type: "technical",
    purifier_model: "MYWATER X1"
  });
  
  const handleChange = (field: keyof RequestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    if (!formData.user_name || !formData.user_email || !formData.subject || !formData.message) {
      return;
    }
    
    await onSubmit(formData);
    
    // Form will be reset by parent component after successful submission
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-spotify-darker border-spotify-accent max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Support Request</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Name"
              value={formData.user_name}
              onChange={(value) => handleChange("user_name", value)}
              placeholder="Client name"
              required
            />
            
            <FormInput
              label="Email"
              type="email"
              value={formData.user_email}
              onChange={(value) => handleChange("user_email", value)}
              placeholder="client@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Support Type</label>
            <Select 
              value={formData.support_type} 
              onValueChange={(value) => handleChange("support_type", value)}
            >
              <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
                <SelectValue placeholder="Select support type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Support</SelectItem>
                <SelectItem value="installation">Installation Assistance</SelectItem>
                <SelectItem value="maintenance">Maintenance Help</SelectItem>
                <SelectItem value="order">Order Inquiry</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Purifier Model</label>
            <Select 
              value={formData.purifier_model} 
              onValueChange={(value) => handleChange("purifier_model", value)}
            >
              <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
                <SelectValue placeholder="Select purifier model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MYWATER X1">MYWATER X1</SelectItem>
                <SelectItem value="MYWATER X2">MYWATER X2</SelectItem>
                <SelectItem value="MYWATER Pro">MYWATER Pro</SelectItem>
                <SelectItem value="MYWATER Ultra">MYWATER Ultra</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <FormInput
            label="Subject"
            value={formData.subject}
            onChange={(value) => handleChange("subject", value)}
            placeholder="Brief description of the issue"
            required
          />
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Message</label>
            <Textarea
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Detailed description of the issue..."
              className="bg-spotify-accent border-spotify-accent-hover text-white min-h-[120px]"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
