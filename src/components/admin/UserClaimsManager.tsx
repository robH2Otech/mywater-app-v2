
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { setUserClaims, migrateAllUserClaims, refreshUserToken } from "@/utils/admin/claimsService";
import { SuperAdminOnly } from "@/components/auth/RoleBasedAccess";
import { Shield, RefreshCw, Users, AlertTriangle } from "lucide-react";

export function UserClaimsManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<'superadmin' | 'admin' | 'technician' | 'user'>('user');
  const [selectedCompany, setSelectedCompany] = useState("mywater");

  const handleSetClaims = async () => {
    if (!selectedUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await setUserClaims({
        userId: selectedUserId.trim(),
        role: selectedRole,
        company: selectedCompany
      });

      toast({
        title: "Success",
        description: `Claims set successfully for user ${selectedUserId}`,
      });

      // Clear form
      setSelectedUserId("");
      setSelectedRole("user");
      setSelectedCompany("mywater");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set user claims",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrateClaims = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateAllUserClaims();
      
      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${result.migrated} users`,
      });
    } catch (error: any) {
      toast({
        title: "Migration Failed",
        description: error.message || "Failed to migrate user claims",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleRefreshToken = async () => {
    try {
      await refreshUserToken();
      toast({
        title: "Token Refreshed",
        description: "Your authentication token has been refreshed",
      });
      
      // Reload the page to apply new claims
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh token",
        variant: "destructive",
      });
    }
  };

  return (
    <SuperAdminOnly>
      <div className="space-y-6">
        <Card className="bg-spotify-darker border-spotify-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-mywater-blue" />
              User Claims Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-gray-300">User ID</Label>
                <Input
                  id="userId"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  placeholder="Enter Firebase UID"
                  className="bg-spotify-dark border-spotify-accent text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-300">Role</Label>
                <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                  <SelectTrigger className="bg-spotify-dark border-spotify-accent text-white">
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
                <Label htmlFor="company" className="text-gray-300">Company</Label>
                <Input
                  id="company"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  placeholder="Company name"
                  className="bg-spotify-dark border-spotify-accent text-white"
                />
              </div>
            </div>
            
            <Button
              onClick={handleSetClaims}
              disabled={isLoading}
              className="bg-mywater-blue hover:bg-mywater-blue/90"
            >
              {isLoading ? "Setting Claims..." : "Set User Claims"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-spotify-darker border-spotify-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-green-500" />
                Bulk Migration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Migrate all existing users in Firestore to have proper custom claims.
              </p>
              <Button
                onClick={handleMigrateClaims}
                disabled={isMigrating}
                variant="outline"
                className="w-full"
              >
                {isMigrating ? "Migrating..." : "Migrate All Users"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-spotify-darker border-spotify-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                Token Refresh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Refresh your authentication token to get the latest claims.
              </p>
              <Button
                onClick={handleRefreshToken}
                variant="outline"
                className="w-full"
              >
                Refresh Token
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-spotify-darker border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-2">
            <p>• Custom claims changes take effect immediately but users may need to refresh their tokens</p>
            <p>• Users will need to sign out and sign back in to see permission changes</p>
            <p>• Only superadmins can manage user claims</p>
            <p>• Claims are automatically synced when Firestore user documents are updated</p>
          </CardContent>
        </Card>
      </div>
    </SuperAdminOnly>
  );
}
