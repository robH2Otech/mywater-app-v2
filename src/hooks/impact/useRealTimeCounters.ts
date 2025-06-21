
import { useState, useEffect } from "react";
import { RealTimeCounters } from "./types";

export function useRealTimeCounters() {
  const [realTimeCounters, setRealTimeCounters] = useState<RealTimeCounters>({
    bottlesToday: 0,
    co2Today: 0,
    energyToday: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeCounters(prev => ({
        bottlesToday: prev.bottlesToday + Math.floor(Math.random() * 3),
        co2Today: prev.co2Today + Math.random() * 0.1,
        energyToday: prev.energyToday + Math.random() * 0.05
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return realTimeCounters;
}
