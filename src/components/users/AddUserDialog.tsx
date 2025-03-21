
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UserRole, UserStatus } from "@/types/users";
import { AddUserDialogContent } from "./AddUserDialogContent";

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  role: UserRole;
  status: UserStatus;
  password: string;
}

interface AddUserDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    job_title: "",
    role: "user",
    status: "active",
    password: ""
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.company) {
        throw new Error("First name, last name, email, password and company are required");
      }

      // Add user to Firebase in the app_users_business collection
      const usersCollectionRef = collection(db, "app_users_business");
      await addDoc(usersCollectionRef, {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "User has been added successfully",
      });

      // Reset form and close dialog
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company: "",
        job_title: "",
        role: "user",
        status: "active",
        password: ""
      });
      
      if (onOpenChange) {
        onOpenChange(false);
      }

      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent overflow-hidden">
        <AddUserDialogContent 
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onCancel={() => onOpenChange?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
