
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormInput } from "@/components/shared/FormInput";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  Share2, 
  Copy, 
  Mail, 
  Check, 
  AlertCircle,
  Users,
  Gift,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";

interface ReferralProgramProps {
  userData: any;
}

export function ReferralProgram({ userData }: ReferralProgramProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  // Email form state
  const [referralEmail1, setReferralEmail1] = useState("");
  const [referralEmail2, setReferralEmail2] = useState("");
  const [referralEmail3, setReferralEmail3] = useState("");
  const [referralName1, setReferralName1] = useState("");
  const [referralName2, setReferralName2] = useState("");
  const [referralName3, setReferralName3] = useState("");
  
  // Load referral data
  useEffect(() => {
    if (!userData?.uid) return;
    
    const fetchReferralData = async () => {
      try {
        // Get referral code
        const codeQuery = query(
          collection(db, "referral_codes"),
          where("user_id", "==", userData.uid)
        );
        
        const codeSnapshot = await getDocs(codeQuery);
        
        if (!codeSnapshot.empty) {
          setReferralCode(codeSnapshot.docs[0].data().code);
        } else {
          // Create a referral code if none exists
          const firstName = userData.first_name || "";
          const lastName = userData.last_name || "";
          const newCode = `${firstName.toLowerCase().substring(0, 3)}${lastName.toLowerCase().substring(0, 3)}${Math.floor(Math.random() * 10000)}`;
          
          await addDoc(collection(db, "referral_codes"), {
            user_id: userData.uid,
            code: newCode,
            created_at: new Date()
          });
          
          setReferralCode(newCode);
        }
        
        // Get referrals
        const referralsQuery = query(
          collection(db, "referrals"),
          where("referrer_id", "==", userData.uid)
        );
        
        const referralsSnapshot = await getDocs(referralsQuery);
        
        if (!referralsSnapshot.empty) {
          setReferrals(referralsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })));
        }
      } catch (error) {
        console.error("Error fetching referral data:", error);
      }
    };
    
    fetchReferralData();
  }, [userData]);
  
  const handleCopyReferralLink = () => {
    const referralLink = `https://mywater.com/refer?code=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    
    toast({
      title: "Link Copied",
      description: "Referral link has been copied to clipboard",
    });
  };
  
  const handleSendEmails = async () => {
    setIsLoading(true);
    
    try {
      const emails = [
        { email: referralEmail1, name: referralName1 },
        { email: referralEmail2, name: referralName2 },
        { email: referralEmail3, name: referralName3 }
      ].filter(e => e.email && e.name);
      
      if (emails.length === 0) {
        toast({
          title: "No recipients specified",
          description: "Please add at least one email and name",
          variant: "destructive",
        });
        return;
      }
      
      // In a real app, this would send actual emails
      // For now, we'll just create referral records
      for (const { email, name } of emails) {
        await addDoc(collection(db, "referrals"), {
          referrer_id: userData.uid,
          referrer_name: `${userData.first_name} ${userData.last_name}`,
          referral_email: email,
          referral_name: name,
          referral_code: referralCode,
          status: "pending",
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      // Update referrals list
      const referralsQuery = query(
        collection(db, "referrals"),
        where("referrer_id", "==", userData.uid)
      );
      
      const referralsSnapshot = await getDocs(referralsQuery);
      
      if (!referralsSnapshot.empty) {
        setReferrals(referralsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      }
      
      toast({
        title: "Invitations Sent",
        description: `Successfully sent ${emails.length} invitation${emails.length === 1 ? "" : "s"}`,
      });
      
      // Reset form
      setReferralEmail1("");
      setReferralEmail2("");
      setReferralEmail3("");
      setReferralName1("");
      setReferralName2("");
      setReferralName3("");
      setShowEmailForm(false);
      
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast({
        title: "Error",
        description: "Failed to send invitations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClaimReward = async () => {
    if (!userData?.id) return;
    
    setIsLoading(true);
    
    try {
      const userDocRef = doc(db, "private_users", userData.id);
      
      await updateDoc(userDocRef, {
        referral_reward_claimed: true,
        updated_at: new Date()
      });
      
      // Update local userData
      userData.referral_reward_claimed = true;
      
      toast({
        title: "Reward Claimed",
        description: "Your free cartridge reward has been claimed. We'll send it to your address!",
      });
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast({
        title: "Error",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Count completed referrals
  const completedReferrals = referrals.filter(ref => ref.status === "purchased").length;
  const referralProgress = (completedReferrals / 3) * 100;
  const hasEarnedReward = completedReferrals >= 3;
  
  return (
    <div className="space-y-6">
      <Card className="bg-spotify-darker border-spotify-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-mywater-blue" />
            Referral Program
          </CardTitle>
          <CardDescription>
            Refer friends and earn a free replacement cartridge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Tracker */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Your Referral Progress</h3>
                <p className="text-gray-400 text-sm">{completedReferrals}/3 Friends Purchased</p>
              </div>
              <Progress value={referralProgress} className="h-2" />
              <p className="text-sm text-gray-400">
                Refer 3 friends who purchase a MYWATER purifier and earn a free replacement cartridge!
              </p>
            </div>
            
            {/* Reward Alert */}
            {hasEarnedReward && !userData?.referral_reward_claimed && (
              <Alert className="border-green-500 bg-green-500/10">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-green-500 font-medium mb-1">Congratulations! Reward Earned</h4>
                    <p className="text-sm text-gray-300">
                      You've successfully referred 3 friends who purchased MYWATER purifiers. 
                      Claim your free replacement cartridge now!
                    </p>
                    <Button 
                      onClick={handleClaimReward} 
                      className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                      disabled={isLoading}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Claim Free Cartridge
                    </Button>
                  </div>
                </div>
              </Alert>
            )}
            
            {userData?.referral_reward_claimed && (
              <Alert className="border-green-500 bg-green-500/10">
                <Check className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-gray-300">
                  You've claimed your free replacement cartridge! It will be shipped to your address.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Referral Link */}
            <div className="space-y-2 pt-2">
              <h3 className="text-white font-medium">Your Referral Link</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-spotify-accent rounded-md px-3 py-2 text-gray-300 truncate">
                  https://mywater.com/refer?code={referralCode}
                </div>
                <Button 
                  onClick={handleCopyReferralLink} 
                  size="sm"
                  className="bg-mywater-blue hover:bg-mywater-blue/90"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-gray-400">
                Share this link with friends. When they purchase a MYWATER purifier using your link, 
                you'll get credit toward your free cartridge reward.
              </p>
            </div>
            
            {/* Email Referral Form Toggle */}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="w-full justify-between border-spotify-accent hover:bg-spotify-accent/30"
              >
                <span className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email Invitations
                </span>
                {showEmailForm ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Email Referral Form */}
            {showEmailForm && (
              <div className="space-y-4 pt-2 border-t border-gray-700">
                <h3 className="text-white font-medium">Invite Friends via Email</h3>
                
                <div className="space-y-4">
                  {/* Friend 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                      label="Friend's Name"
                      value={referralName1}
                      onChange={setReferralName1}
                      placeholder="John Doe"
                    />
                    <FormInput
                      label="Friend's Email"
                      type="email"
                      value={referralEmail1}
                      onChange={setReferralEmail1}
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  {/* Friend 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                      label="Friend's Name"
                      value={referralName2}
                      onChange={setReferralName2}
                      placeholder="Jane Doe"
                    />
                    <FormInput
                      label="Friend's Email"
                      type="email"
                      value={referralEmail2}
                      onChange={setReferralEmail2}
                      placeholder="jane@example.com"
                    />
                  </div>
                  
                  {/* Friend 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                      label="Friend's Name"
                      value={referralName3}
                      onChange={setReferralName3}
                      placeholder="Sam Smith"
                    />
                    <FormInput
                      label="Friend's Email"
                      type="email"
                      value={referralEmail3}
                      onChange={setReferralEmail3}
                      placeholder="sam@example.com"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button
                    onClick={handleSendEmails}
                    className="bg-mywater-blue hover:bg-mywater-blue/90"
                    disabled={isLoading}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {isLoading ? "Sending..." : "Send Invitations"}
                  </Button>
                </div>
                
                <Alert className="bg-spotify-dark border-gray-700">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <AlertDescription className="text-sm text-gray-400">
                    We'll send a personalized invitation email with your referral link 
                    and a 20% discount offer to each friend.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {/* Referrals List */}
            {referrals.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <h3 className="text-white font-medium">Your Referrals</h3>
                
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div 
                      key={referral.id}
                      className="flex items-center justify-between p-3 rounded-md bg-spotify-dark"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-white">{referral.referral_name}</p>
                          <p className="text-xs text-gray-400">{referral.referral_email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          referral.status === "purchased" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {referral.status === "purchased" ? "Purchased" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
