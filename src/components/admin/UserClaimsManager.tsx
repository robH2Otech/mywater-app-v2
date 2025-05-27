
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { setUserClaims, migrateAllUserClaims, refreshUserToken } from "@/utils/admin/claimsService";
import { Loader2, Shield, Users, RefreshCw } from "lucide-react";

export function UserClaimsManager() {
  const { toast } = useToast();
  const [isSettingClaims, setIsSettingClaims] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [claimsForm, setClaimsForm] = useState({
    userId: "",
    role: "user" as const,
    company: "X-WATER"
  });

  const handleSetClaims = async () => {
    if (!claimsForm.userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a User ID",
        variant: "destructive",
      });
      return;
    }

    setIsSettingClaims(true);
    try {
      await setUserClaims(claimsForm);
      
      toast({
        title: "Success",
        description: `Claims set successfully for user: ${claimsForm.role}@${claimsForm.company}`,
      });
      
      // Clear the form
      setClaimsForm({
        userId: "",
        role: "user",
        company: "X-WATER"
      });
    } catch (error: any) {
      console.error("Failed to set claims:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSettingClaims(false);
    }
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateAllUserClaims();
      
      toast({
        title: "Migration Complete",
        description: `${result.migrated} users migrated, ${result.skipped} skipped, ${result.errors} errors`,
      });
    } catch (error: any) {
      console.error("Migration failed:", error);
      toast({
        title: "Migration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshUserToken();
      
      if (success) {
        toast({
          title: "Success",
          description: "Token refreshed successfully. Updated claims are now active.",
        });
      } else {
        toast({
          title: "Info",
          description: "No user logged in to refresh token for.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Failed to refresh token:", error);
      toast({
        title: "Error",
        description: "Failed to refresh token",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-spotify-darker border-spotify-accent">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-mywater-blue" />
            Set User Claims
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manually set custom claims for a specific user (superadmin only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">User ID (UID)</label>
              <Input
                placeholder="Enter Firebase User ID"
                value={claimsForm.userId}
                onChange={(e) => setClaimsForm({ ...claimsForm, userId: e.target.value })}
                className="bg-spotify-accent border-spotify-accent-hover text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Role</label>
              <Select
                value={claimsForm.role}
                onValueChange={(value: any) => setClaimsForm({ ...claimsForm, role: value })}
              >
                <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Company</label>
              <Input
                value={claimsForm.company}
                onChange={(e) => setClaimsForm({ ...claimsForm, company: e.target.value })}
                className="bg-spotify-accent border-spotify-accent-hover text-white"
              />
            </div>
          </div>
          
          <Button
            onClick={handleSetClaims}
            disabled={isSettingClaims}
            className="w-full bg-mywater-blue hover:bg-mywater-blue/90"
          >
            {isSettingClaims && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Set Claims
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-spotify-darker border-spotify-accent">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-mywater-blue" />
              Migrate All Users
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sync all existing users from Firestore to have proper custom claims
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleMigration}
              disabled={isMigrating}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isMigrating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Migrate All Users
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-spotify-darker border-spotify-accent">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-mywater-blue" />
              Refresh Token
            </CardTitle>
            <CardDescription className="text-gray-400">
              Force refresh your authentication token to get updated claims
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleRefreshToken}
              disabled={isRefreshing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isRefreshing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Refresh Token
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
