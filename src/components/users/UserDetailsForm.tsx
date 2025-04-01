
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserRole, UserStatus } from "@/types/users";
import { BasicInfoTab } from "./form-tabs/BasicInfoTab";
import { WorkDetailsTab } from "./form-tabs/WorkDetailsTab";
import { AccountSettingsTab } from "./form-tabs/AccountSettingsTab";

interface UserFormData {
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

interface UserDetailsFormProps {
  formData: UserFormData;
  handleInputChange: (field: keyof UserFormData, value: string) => void;
  isEditable: boolean;
}

export function UserDetailsForm({ formData, handleInputChange, isEditable }: UserDetailsFormProps) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="mb-4 bg-spotify-darker border border-spotify-accent">
        <TabsTrigger value="basic" className="data-[state=active]:bg-spotify-accent data-[state=active]:text-white">
          Basic Info
        </TabsTrigger>
        <TabsTrigger value="work" className="data-[state=active]:bg-spotify-accent data-[state=active]:text-white">
          Work Details
        </TabsTrigger>
        <TabsTrigger value="account" className="data-[state=active]:bg-spotify-accent data-[state=active]:text-white">
          Account Settings
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-4">
        <BasicInfoTab 
          formData={formData}
          handleInputChange={handleInputChange}
          isEditable={isEditable}
        />
      </TabsContent>
      
      <TabsContent value="work" className="space-y-4">
        <WorkDetailsTab
          formData={formData}
          handleInputChange={handleInputChange}
          isEditable={isEditable}
        />
      </TabsContent>
      
      <TabsContent value="account" className="space-y-4">
        <AccountSettingsTab
          formData={formData}
          handleInputChange={handleInputChange}
          isEditable={isEditable}
        />
      </TabsContent>
    </Tabs>
  );
}
