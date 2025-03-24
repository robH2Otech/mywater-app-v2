
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/integrations/firebase/client";
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { addDays, format, isBefore, differenceInDays } from "date-fns";

export function usePrivateUserData() {
  const navigate = useNavigate();
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
  
  // Calculate cartridge usage percentage
  const calculateCartridgeUsage = () => {
    if (!userData?.purchase_date || !userData?.cartridge_replacement_date) return 0;
    
    const purchaseDate = userData.purchase_date.toDate();
    const replacementDate = userData.cartridge_replacement_date.toDate();
    const today = new Date();
    
    // Total days in cartridge lifecycle (typically 365 days)
    const totalDays = differenceInDays(replacementDate, purchaseDate);
    
    // Days used so far
    const daysUsed = differenceInDays(today, purchaseDate);
    
    // Percentage used (capped at 100%)
    return Math.min(100, Math.max(0, Math.round((daysUsed / totalDays) * 100)));
  };
  
  const cartridgeUsagePercent = calculateCartridgeUsage();

  return {
    userData,
    loading,
    daysUntilReplacement,
    isReplacementDueSoon,
    isReplacementOverdue,
    formattedReplacementDate,
    cartridgeUsagePercent
  };
}
