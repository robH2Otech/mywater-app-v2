
import { format, addMonths } from "date-fns";
import { TimeRange } from "@/hooks/chart/useWaterUsageData";

/**
 * Generates sample chart data when no real data is available
 */
export const generateSampleData = (range: TimeRange) => {
  const now = new Date();
  let data = [];
  
  if (range === "24h") {
    for (let i = 0; i < 24; i++) {
      const time = new Date(now);
      time.setHours(now.getHours() - (24 - i));
      data.push({ 
        name: time.getHours().toString().padStart(2, '0') + ':00', 
        volume: Math.random() * 7 
      });
    }
  } else if (range === "7d") {
    for (let i = 0; i < 7; i++) {
      const day = new Date(now);
      day.setDate(now.getDate() - (7 - i));
      data.push({ 
        name: format(day, "d.M."), 
        volume: Math.random() * 500 
      });
    }
  } else if (range === "30d") {
    [1, 7, 14, 21, 30].forEach(day => {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      data.push({ 
        name: `${day}.${now.getMonth() + 1}.`, 
        volume: Math.random() * 1000 
      });
    });
  } else if (range === "6m") {
    for (let i = 5; i >= 0; i--) {
      const month = addMonths(now, -i);
      data.push({ 
        name: format(month, "MMM yyyy"), 
        volume: Math.random() * 20000 
      });
    }
  }
  
  return data;
};
