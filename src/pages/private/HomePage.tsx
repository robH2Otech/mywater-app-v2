
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";
import { HomeStats } from "@/components/dashboard/private/HomeStats";
import { CartridgeVisualization } from "@/components/users/private/CartridgeVisualization";
import { CartridgeAlert } from "@/components/dashboard/private/CartridgeAlert";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { ShieldCheck, Droplets, Share2 } from "lucide-react";

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
      
      <div className="grid grid-cols-1 gap-6">
        {/* Main Content Card with gradient background */}
        <GlassCard className="p-6 overflow-hidden bg-gradient-to-br from-mywater-dark/50 to-slate-900/50">
          <h2 className="text-xl font-medium text-white mb-4 flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-mywater-accent" />
            Water Purification System
          </h2>
          
          <div className={`grid ${isSmallScreen ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-8'}`}>
            {/* Left side: Stats */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <HomeStats 
                userData={userData}
                daysUntilReplacement={daysUntilReplacement}
                isReplacementOverdue={isReplacementOverdue}
                isReplacementDueSoon={isReplacementDueSoon}
              />
            </motion.div>
            
            {/* Right side: Cartridge visualization */}
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <CartridgeVisualization 
                percentage={safeCartridgeUsagePercent} 
                height={240}
              />
            </motion.div>
          </div>
        </GlassCard>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard 
            title="Water Quality Report"
            description="View your latest water quality metrics"
            icon={Droplets}
            link="/private-dashboard/data"
            color="from-blue-600/30 to-cyan-600/20"
          />
          
          <QuickActionCard 
            title="Refer Friends"
            description="Share MYWATER and earn rewards"
            icon={Share2}
            link="/private-dashboard/refer"
            color="from-purple-600/30 to-pink-600/20"
          />
          
          <QuickActionCard 
            title="Order Replacement"
            description="Time for a new cartridge?"
            icon={ShieldCheck}
            link="/private-dashboard/shop"
            color="from-emerald-600/30 to-green-600/20"
          />
        </div>
      </div>
    </motion.div>
  );
}

function QuickActionCard({ title, description, icon: Icon, link, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className={`h-full p-4 cursor-pointer bg-gradient-to-br ${color} border-white/5`}>
        <a href={link} className="flex flex-col h-full">
          <div className="flex items-center mb-2">
            <Icon className="h-5 w-5 mr-2 text-white/80" />
            <h3 className="font-medium text-white">{title}</h3>
          </div>
          <p className="text-sm text-gray-300/80">{description}</p>
        </a>
      </GlassCard>
    </motion.div>
  );
}
