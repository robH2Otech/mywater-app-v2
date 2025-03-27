
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

interface SupportContactFormProps {
  userData: any;
}

export function SupportContactForm({ userData }: SupportContactFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [supportType, setSupportType] = useState("technical");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message) {
      toast({
        title: "Missing information",
        description: "Please complete all fields before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save support request to Firestore
      await addDoc(collection(db, "support_requests"), {
        user_id: userData.uid,
        user_name: `${userData.first_name} ${userData.last_name}`,
        user_email: userData.email,
        subject,
        message,
        support_type: supportType,
        purifier_model: userData.purifier_model,
        status: "new",
        created_at: new Date(),
      });
      
      // Reset form
      setSubject("");
      setMessage("");
      setSupportType("technical");
      
      toast({
        title: "Request submitted",
        description: "Your support request has been submitted successfully. Our team will contact you shortly.",
      });
    } catch (error) {
      console.error("Error submitting support request:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-spotify-darker rounded-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Name"
            value={`${userData.first_name || ''} ${userData.last_name || ''}`}
            onChange={() => {}}
            disabled
          />
          <FormInput
            label="Email Address"
            value={userData.email || ''}
            onChange={() => {}}
            disabled
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Support Type</label>
          <Select value={supportType} onValueChange={setSupportType}>
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
        
        <FormInput
          label="Subject"
          value={subject}
          onChange={setSubject}
          placeholder="Brief description of your issue"
          required
        />
        
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please describe your issue in detail..."
            className="bg-spotify-accent border-spotify-accent-hover text-white h-32"
            required
          />
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-mywater-blue hover:bg-mywater-blue/90"
      >
        {isLoading ? (
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
    </form>
  );
}
