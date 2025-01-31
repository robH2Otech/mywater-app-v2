import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Phone, Building2, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export const Users = () => {
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-spotify-darker">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-1/3 bg-spotify-accent" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-2/3 bg-spotify-accent" />
                <Skeleton className="h-4 w-1/2 bg-spotify-accent" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-400">Manage system users and permissions</p>
        </div>
        <Button
          onClick={() => {
            toast({
              title: "Coming soon",
              description: "This feature is not yet implemented.",
            });
          }}
          className="bg-spotify-green hover:bg-spotify-green/90"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                  <p className="text-sm text-gray-400">{user.role}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="h-4 w-4" />
                      {user.phone}
                    </div>
                  )}
                  {user.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Building2 className="h-4 w-4" />
                      {user.company}
                    </div>
                  )}
                  {user.job_title && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Briefcase className="h-4 w-4" />
                      {user.job_title}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};