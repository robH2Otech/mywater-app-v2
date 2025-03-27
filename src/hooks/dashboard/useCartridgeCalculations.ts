
import { useMemo } from "react";
import { differenceInDays, format } from "date-fns";
import { PrivateUser } from "@/types/privateUser";

export function useCartridgeCalculations(userData: PrivateUser | null) {
  // Calculate days until cartridge replacement
  const daysUntilReplacement = useMemo(() => {
    if (!userData?.cartridge_replacement_date) return null;
    
    const replacementDate = userData.cartridge_replacement_date;
    const today = new Date();
    
    return differenceInDays(replacementDate, today);
  }, [userData]);

  // Determine if replacement is due soon or overdue
  const isReplacementDueSoon = useMemo(() => {
    return daysUntilReplacement !== null && daysUntilReplacement <= 30 && daysUntilReplacement >= 0;
  }, [daysUntilReplacement]);
  
  const isReplacementOverdue = useMemo(() => {
    return daysUntilReplacement !== null && daysUntilReplacement < 0;
  }, [daysUntilReplacement]);
  
  // Format replacement date
  const formattedReplacementDate = useMemo(() => {
    return userData?.cartridge_replacement_date
      ? format(userData.cartridge_replacement_date, 'MMMM d, yyyy')
      : 'Not available';
  }, [userData]);
  
  // Calculate cartridge usage percentage
  const cartridgeUsagePercent = useMemo(() => {
    if (!userData?.purchase_date || !userData?.cartridge_replacement_date) return 0;
    
    const purchaseDate = userData.purchase_date;
    const replacementDate = userData.cartridge_replacement_date;
    const today = new Date();
    
    // Total days in cartridge lifecycle (typically 365 days)
    const totalDays = differenceInDays(replacementDate, purchaseDate);
    
    // Days used so far
    const daysUsed = differenceInDays(today, purchaseDate);
    
    // Percentage used (capped at 100%)
    return Math.min(100, Math.max(0, Math.round((daysUsed / totalDays) * 100)));
  }, [userData]);

  return {
    daysUntilReplacement,
    isReplacementDueSoon,
    isReplacementOverdue,
    formattedReplacementDate,
    cartridgeUsagePercent
  };
}
