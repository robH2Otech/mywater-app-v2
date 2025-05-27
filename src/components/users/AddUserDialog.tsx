
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/integrations/firebase/client";
import { UserRole, UserStatus } from "@/types/users";
import { AddUserDialogContent } from "./AddUserDialogContent";
import { usePermissions } from "@/hooks/usePermissions";

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
  const { hasPermission, userRole, company: currentUserCompany } = usePermissions();
  
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: currentUserCompany || "",
    job_title: "",
    role: "user", // Default role for new users
    status: "active",
    password: ""
  });

  // Check if user can create users with specific role
  const canCreateWithRole = (role: UserRole): boolean => {
    if (userRole === "superadmin") return true;
    if (userRole === "admin" && ["technician", "user"].includes(role)) return true;
    return false;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === "role" && !canCreateWithRole(value as UserRole)) {
      toast({
        title: "Permission denied",
        description: `You don't have permission to create ${value} users`,
        variant: "destructive",
      });
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Only admins and above can create users
      if (!hasPermission("admin")) {
        throw new Error("You don't have permission to create users");
      }
      
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.company) {
        throw new Error("First name, last name, email, password and company are required");
      }

      // Validate role permissions
      if (!canCreateWithRole(formData.role)) {
        throw new Error(`You don't have permission to create ${formData.role} users`);
      }

      console.log("Creating new user:", formData.email);

      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;
      
      console.log("Firebase Auth user created with UID:", firebaseUser.uid);

      // Step 2: Create Firestore document using the Firebase Auth UID as document ID
      const userDocRef = doc(db, "app_users_business", firebaseUser.uid);
      await setDoc(userDocRef, {
        id: firebaseUser.uid,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || "",
        company: formData.company,
        job_title: formData.job_title || "",
        role: formData.role,
        status: formData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log("Firestore document created successfully");

      toast({
        title: "Success",
        description: "User has been created successfully in both Authentication and Firestore",
      });

      // Reset form and close dialog
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company: currentUserCompany || "",
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
      console.error("Error creating user:", error);
      
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "A user with this email already exists";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      }

      toast({
        title: "Error",
        description: errorMessage,
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
          canCreateSuperAdmin={userRole === "superadmin"}
          canCreateAdmin={userRole === "superadmin"}
        />
      </DialogContent>
    </Dialog>
  );
}
