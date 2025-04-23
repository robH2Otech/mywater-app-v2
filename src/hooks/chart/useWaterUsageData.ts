
import { useState, useEffect } from "react";
import { Timestamp, collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { subDays, subHours, subMonths, endOfDay, startOfDay, format, isSameDay, isSameMonth, addDays, addMonths } from "date-fns";
import { calculateHourlyFlowRates } from "@/utils/chart/waterUsageCalculations";

export type TimeRange = "24h" | "7d" | "30d" | "6m";

function groupByDay(measurements: any[]): any[] {
  const dayMap: { [date: string]: { date: Date, total: number, count: number } } = {};
  for (const m of measurements) {
    if (!m.timestamp) continue;
    const d = new Date(m.timestamp);
    const dateStr = format(d, "yyyy-MM-dd");
    const v = typeof m.volume === "number" ? m.volume : parseFloat(m.volume ?? "0");
    if (!dayMap[dateStr]) {
      dayMap[dateStr] = { date: new Date(format(d, "yyyy-MM-dd")), total: 0, count: 0 };
    }
    dayMap[dateStr].total += v;
    dayMap[dateStr].count += 1;
  }
  return Object.values(dayMap).map(({ date, total, count }) => ({
    name: format(date, "d.M."), volume: count > 0 ? Number((total / count).toFixed(2)) : 0
  })).sort((a, b) => a.name.localeCompare(b.name));
}

function groupByImportantDays(measurements: any[]): any[] {
  const daysOfMonth = [1, 7, 14, 21];
  const result: { [key: string]: { name: string, volumeSum: number, count: number } } = {};
  let lastDayStr = "";
  let lastDayNum = 1;
  let month = 1, year = 2024;

  if (measurements.length > 0) {
    const firstDate = new Date(measurements[0].timestamp);
    month = firstDate.getMonth() + 1;
    year = firstDate.getFullYear();
    lastDayNum = new Date(year, month, 0).getDate();
    lastDayStr = `${lastDayNum}.${month}.`;
    daysOfMonth.push(lastDayNum);
  }

  for (const day of daysOfMonth) {
    const pick = measurements.filter(m => {
      const d = new Date(m.timestamp);
      return d.getDate() === day;
    });
    const sum = pick.reduce((total, m) => total + (typeof m.volume === "number" ? m.volume : parseFloat(m.volume ?? "0")), 0);
    const count = pick.length;
    const name = `${day}.${month}.`;
    result[name] = { name, volumeSum: sum, count };
  }
  return Object.values(result).map(item => ({
    name: item.name,
    volume: item.count > 0 ? Number((item.volumeSum / item.count).toFixed(2)) : 0
  }));
}

function groupByMonth(measurements: any[]): any[] {
  const monthMap: { [month: string]: { monthDate: Date, total: number, count: number } } = {};
  for (const m of measurements) {
    if (!m.timestamp) continue;
    const d = new Date(m.timestamp);
    const monthStr = format(d, "yyyy-MM");
    if (!monthMap[monthStr]) {
      monthMap[monthStr] = { monthDate: new Date(d.getFullYear(), d.getMonth(), 1), total: 0, count: 0 };
    }
    const v = typeof m.volume === "number" ? m.volume : parseFloat(m.volume ?? "0");
    monthMap[monthStr].total += v;
    monthMap[monthStr].count += 1;
  }
  return Object.values(monthMap)
    .map(({ monthDate, total, count }) => ({
      name: format(monthDate, "MMM yyyy"),
      volume: count > 0 ? Number((total / count).toFixed(2)) : 0
    }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
}

export const useWaterUsageData = (units: any[] = [], timeRange: TimeRange) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMeasurementsForTimeRange = async (range: TimeRange) => {
    if (!units || units.length === 0) {
      console.log("No units provided for water usage chart");
      setChartData([]);
      return;
    }

    setIsLoading(true);
    try {
      const endDate = new Date();
      let startDate: Date;
      let measurementLimit: number;

      switch (range) {
        case "7d":
          startDate = subDays(endDate, 7);
          measurementLimit = 168;
          break;
        case "30d":
          startDate = subDays(endDate, 30);
          measurementLimit = 200;
          break;
        case "6m":
          startDate = subMonths(endDate, 6);
          measurementLimit = 400;
          break;
        case "24h":
        default:
          startDate = subHours(endDate, 24);
          measurementLimit = 48;
          break;
      }

      const allMeasurements = [];

      for (const unit of units) {
        if (!unit.id) continue;
        const collectionPath = unit.id.startsWith("MYWATER_")
          ? `units/${unit.id}/data`
          : `units/${unit.id}/measurements`;

        try {
          const q = query(
            collection(db, collectionPath),
            where("timestamp", ">=", Timestamp.fromDate(startDate)),
            where("timestamp", "<=", Timestamp.fromDate(endDate)),
            orderBy("timestamp", "asc"),
            limit(measurementLimit)
          );
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) continue;
          const measurements = querySnapshot.docs.map(doc => {
            const data = doc.data();
            let timestamp = data.timestamp;
            if (timestamp && typeof timestamp.toDate === "function") {
              timestamp = timestamp.toDate();
            } else if (typeof timestamp === "string") {
              timestamp = new Date(timestamp);
            }
            return { ...data, id: doc.id, timestamp };
          });
          allMeasurements.push(...measurements);
        } catch (err) {
          console.log(`Error fetching measurements for unit ${unit.id}:`, err);
        }
      }

      console.log(`Fetched ${allMeasurements.length} measurements for ${range} chart`);
      
      let chart: any[] = [];

      if (allMeasurements.length < 2) {
        setChartData(generateSampleData(range));
        setIsLoading(false);
        return;
      }

      if (range === "24h") {
        try {
          chart = calculateHourlyFlowRates(allMeasurements);
          console.log(`Calculated ${chart.length} hourly flow rates`);
          
          // If no hourly data was calculated, use sample data
          if (chart.length === 0) {
            chart = generateSampleData("24h");
          }
        } catch (error) {
          console.error("Error calculating hourly flow rates:", error);
          chart = generateSampleData("24h");
        }
      } else if (range === "7d") {
        chart = groupByDay(allMeasurements);
      } else if (range === "30d") {
        chart = groupByImportantDays(allMeasurements);
      } else if (range === "6m") {
        chart = groupByMonth(allMeasurements);
      }

      setChartData(chart);
    } catch (error) {
      console.error(`Error fetching ${timeRange} data:`, error);
      setChartData(generateSampleData(range));
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleData = (range: TimeRange) => {
    const now = new Date();
    let data = [];
    if (range === "24h") {
      for (let i = 0; i < 24; i++) {
        const time = new Date(now); time.setHours(now.getHours() - (24 - i));
        data.push({ name: time.getHours().toString().padStart(2, '0') + ':00', volume: Math.random() * 7 });
      }
    } else if (range === "7d") {
      for (let i = 0; i < 7; i++) {
        const day = new Date(now); day.setDate(now.getDate() - (7 - i));
        data.push({ name: format(day, "d.M."), volume: Math.random() * 500 });
      }
    } else if (range === "30d") {
      [1, 7, 14, 21, 30].forEach(day => {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        data.push({ name: `${day}.${now.getMonth() + 1}.`, volume: Math.random() * 1000 });
      });
    } else if (range === "6m") {
      for (let i = 5; i >= 0; i--) {
        const month = addMonths(now, -i);
        data.push({ name: format(month, "MMM yyyy"), volume: Math.random() * 20000 });
      }
    }
    return data;
  };

  useEffect(() => {
    fetchMeasurementsForTimeRange(timeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, JSON.stringify(units)]);

  return { chartData, isLoading };
};
