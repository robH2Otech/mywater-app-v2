
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnitCard } from "@/components/units/UnitCard";
import { AddUnitDialog } from "@/components/units/AddUnitDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAllUnits } from "@/hooks/useAllData";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Units = () => {
  const { toast } = useToast();
  const { userRole, company } = useAuth();
  const { t } = useLanguage();
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  
  // Use simple data fetching - NO FILTERING, NO COMPLEX LOGIC
  const { data: units = [], isLoading, error } = useAllUnits();

  console.log("Units page - Simple data fetch:", {
    userRole,
    company,
    unitsCount: units.length,
    allUnits: units.map(u => ({ id: u.id, name: u.name, company: u.company }))
  });

  if (error) {
    console.error("Error loading units:", error);
    toast({
      title: t("toast.error"),
      description: t("units.failed.to.fetch"),
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn p-2 md:p-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{t("units.title")}</h1>
          <p className="text-sm md:text-base text-gray-400">
            ✅ {t("units.all.from.companies")} ({units.length} {t("units.total")})
            {userRole === 'superadmin' && <span className="text-green-400 ml-2">({t("dashboard.superadmin.access")})</span>}
          </p>
        </div>
        <Button 
          onClick={() => setIsAddUnitOpen(true)}
          className="bg-mywater-blue hover:bg-mywater-blue/90 w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("units.add")}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[180px] bg-spotify-darker animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              id={unit.id}
              name={unit.name}
              status={unit.status || "active"}
              location={unit.location}
              total_volume={unit.total_volume}
              last_maintenance={unit.last_maintenance}
              unit_type={unit.unit_type}
            />
          ))}
        </div>
      )}

      {units.length === 0 && !isLoading && (
        <div className="text-center text-gray-400 py-8">
          {t("units.no.units.found")}
        </div>
      )}

      <AddUnitDialog 
        open={isAddUnitOpen} 
        onOpenChange={setIsAddUnitOpen} 
      />
    </div>
  );
}

export default Units;
