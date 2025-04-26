
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";
import { HomeStats } from "@/components/dashboard/private/HomeStats";
import { CartridgeVisualization } from "@/components/users/private/CartridgeVisualization";
import { CartridgeAlert } from "@/components/dashboard/private/CartridgeAlert";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";

export function HomePage() {
  const {
    userData,
    loading,
    daysUntilReplacement,
    isReplacementDueSoon,
    isReplacementOverdue,
    formattedReplacementDate,
    cartridgeUsagePercent
  } = usePrivateUserData();
  
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isSmallScreen = isMobile || isTablet;

  const safeCartridgeUsagePercent = typeof cartridgeUsagePercent === 'number' 
    ? cartridgeUsagePercent 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex flex-col items-center"
        >
          <div className="w-10 h-10 border-t-2 border-b-2 border-mywater-accent rounded-full animate-spin"></div>
          <p className="text-mywater-accent/80 mt-4">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <CartridgeAlert 
        isReplacementDueSoon={isReplacementDueSoon}
        isReplacementOverdue={isReplacementOverdue}
        formattedReplacementDate={formattedReplacementDate}
      />
      
      <div className={`grid ${isSmallScreen ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-6'}`}>
        <div className={isSmallScreen ? '' : 'col-span-1'}>
          <GlassCard className="h-full p-4">
            <HomeStats 
              userData={userData}
              daysUntilReplacement={daysUntilReplacement}
              isReplacementOverdue={isReplacementOverdue}
              isReplacementDueSoon={isReplacementDueSoon}
            />
          </GlassCard>
        </div>
        
        <div className={`${isSmallScreen ? 'mt-6' : 'col-span-2'}`}>
          <GlassCard className="h-full p-6" gradient>
            <CartridgeVisualization 
              percentage={safeCartridgeUsagePercent} 
              height={240}
              compactMode={!isSmallScreen}
            />
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
