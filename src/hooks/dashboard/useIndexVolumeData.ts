
import { useState, useEffect } from "react";
import { UnitData } from "@/types/analytics";
import { fetchUnitTotalVolumes } from "@/utils/measurements/unitVolumeUtils";

export function useIndexVolumeData(units: UnitData[]) {
  const [totalVolume, setTotalVolume] = useState<number>(0);
  const [isVolumeLoading, setIsVolumeLoading] = useState<boolean>(true);

  // Calculate total volume from units
  useEffect(() => {
    const loadTotalVolumes = async () => {
      if (units && units.length > 0) {
        setIsVolumeLoading(true);
        try {
          const totalVol = await fetchUnitTotalVolumes(units.map(unit => unit.id));
          setTotalVolume(totalVol);
        } catch (error) {
          console.error("Error fetching total volumes:", error);
        } finally {
          setIsVolumeLoading(false);
        }
      } else {
        setTotalVolume(0);
        setIsVolumeLoading(false);
      }
    };
    
    loadTotalVolumes();
  }, [units]);

  const formattedVolume = totalVolume ? `${totalVolume}m³` : "0m³";

  return {
    formattedVolume,
    isVolumeLoading
  };
}
