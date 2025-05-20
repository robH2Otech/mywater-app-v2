
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="filter-expiry" className="text-base font-medium">Filter Expiry Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when your filter needs replacing</p>
            </div>
            <Switch id="filter-expiry" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="promotions" className="text-base font-medium">Promotional Offers</Label>
              <p className="text-sm text-muted-foreground">Receive occasional promotional offers</p>
            </div>
            <Switch id="promotions" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="referral-updates" className="text-base font-medium">Referral Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified about your referral status</p>
            </div>
            <Switch id="referral-updates" defaultChecked />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">To change your account details, please visit your profile page.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Privacy</CardTitle>
          <CardDescription>Manage how we use your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="usage-data" className="text-base font-medium">Usage Analytics</Label>
              <p className="text-sm text-muted-foreground">Allow us to collect anonymous usage data</p>
            </div>
            <Switch id="usage-data" defaultChecked />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Download My Data</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
