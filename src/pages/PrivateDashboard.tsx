
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  User, 
  Calendar, 
  Settings, 
  Share2, 
  LogOut, 
  AlertCircle,
  Clock,
  Check,
  UserCircle
} from "lucide-react";
import { addDays, format, isBefore, differenceInDays } from "date-fns";
import { auth, db } from "@/integrations/firebase/client";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  DocumentData 
} from "firebase/firestore";
import { PrivateUserProfile } from "@/components/users/private/PrivateUserProfile";
import { ReferralProgram } from "@/components/users/private/ReferralProgram";

export function PrivateDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        
        if (!user) {
          navigate("/private-auth");
          return;
        }
        
        // Get private user data
        const userQuery = query(
          collection(db, "private_users"),
          where("uid", "==", user.uid)
        );
        
        const userSnapshot = await getDocs(userQuery);
        
        if (userSnapshot.empty) {
          console.error("No user data found");
          return;
        }
        
        // Set user data
        setUserData({
          id: userSnapshot.docs[0].id,
          ...userSnapshot.docs[0].data()
        });
        
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  // Calculate days until cartridge replacement
  const getDaysUntilReplacement = () => {
    if (!userData?.cartridge_replacement_date) return null;
    
    const replacementDate = userData.cartridge_replacement_date.toDate();
    const today = new Date();
    
    return differenceInDays(replacementDate, today);
  };
  
  const daysUntilReplacement = getDaysUntilReplacement();
  const isReplacementDueSoon = daysUntilReplacement !== null && daysUntilReplacement <= 30;
  const isReplacementOverdue = daysUntilReplacement !== null && daysUntilReplacement < 0;
  
  // Format replacement date
  const formattedReplacementDate = userData?.cartridge_replacement_date 
    ? format(userData.cartridge_replacement_date.toDate(), 'MMMM d, yyyy')
    : 'Not available';
  
  if (loading) {
    return (
      <div className="min-h-screen bg-spotify-dark flex items-center justify-center">
        <p className="text-white">Loading your data...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-spotify-dark">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">MYWATER Home Portal</h1>
          <Button variant="ghost" onClick={handleSignOut} className="text-gray-400">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        {/* User greeting and status summary */}
        <Card className="mb-6 bg-spotify-darker border-spotify-accent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Hello, {userData?.first_name || "User"}
                </h2>
                <p className="text-gray-400">
                  {userData?.purifier_model || "MYWATER System"} Owner
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Cartridge Status */}
                <div className="bg-spotify-dark rounded-lg p-3 flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    isReplacementOverdue 
                      ? "bg-red-500/20 text-red-500" 
                      : isReplacementDueSoon 
                        ? "bg-amber-500/20 text-amber-500" 
                        : "bg-green-500/20 text-green-500"
                  }`}>
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Cartridge Replacement</p>
                    <p className={`text-sm font-medium ${
                      isReplacementOverdue 
                        ? "text-red-400" 
                        : isReplacementDueSoon 
                          ? "text-amber-400" 
                          : "text-green-400"
                    }`}>
                      {isReplacementOverdue 
                        ? `Overdue by ${Math.abs(daysUntilReplacement!)} days` 
                        : isReplacementDueSoon 
                          ? `Due in ${daysUntilReplacement} days` 
                          : `In ${daysUntilReplacement} days`}
                    </p>
                  </div>
                </div>
                
                {/* Referral Status */}
                <div className="bg-spotify-dark rounded-lg p-3 flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    userData?.referral_reward_earned
                      ? "bg-green-500/20 text-green-500"
                      : "bg-mywater-blue/20 text-mywater-blue"
                  }`}>
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Referral Program</p>
                    <p className="text-sm font-medium text-white">
                      {userData?.referrals_converted || 0}/3 Friends Purchased
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Alert for cartridge replacement */}
        {isReplacementDueSoon && (
          <Alert className="mb-6 border-amber-500 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-500">Cartridge Replacement Reminder</AlertTitle>
            <AlertDescription>
              Your water purifier cartridge will need replacement on {formattedReplacementDate}. 
              Consider ordering a replacement soon to ensure continuous water purification.
            </AlertDescription>
          </Alert>
        )}
        
        {isReplacementOverdue && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-500">Cartridge Replacement Overdue</AlertTitle>
            <AlertDescription>
              Your water purifier cartridge is overdue for replacement. Please replace it as soon as 
              possible to maintain optimal water quality.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Main content tabs */}
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex gap-1">
              <UserCircle className="h-4 w-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex gap-1">
              <Share2 className="h-4 w-4" />
              Referral Program
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <PrivateUserProfile userData={userData} />
          </TabsContent>
          
          <TabsContent value="referrals">
            <ReferralProgram userData={userData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
