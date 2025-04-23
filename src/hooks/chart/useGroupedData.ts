
import { format } from "date-fns";

/**
 * Groups measurements by day and calculates average volume
 */
export const groupByDay = (measurements: any[]): any[] => {
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
  
  return Object.values(dayMap)
    .map(({ date, total, count }) => ({
      name: format(date, "d.M."), 
      volume: count > 0 ? Number((total / count).toFixed(2)) : 0
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Groups measurements by important days in a month (1st, 7th, 14th, 21st, last day)
 */
export const groupByImportantDays = (measurements: any[]): any[] => {
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
    
    const sum = pick.reduce((total, m) => {
      return total + (typeof m.volume === "number" ? m.volume : parseFloat(m.volume ?? "0"));
    }, 0);
    
    const count = pick.length;
    const name = `${day}.${month}.`;
    
    result[name] = { name, volumeSum: sum, count };
  }
  
  return Object.values(result).map(item => ({
    name: item.name,
    volume: item.count > 0 ? Number((item.volumeSum / item.count).toFixed(2)) : 0
  }));
};

/**
 * Groups measurements by month and calculates average volume
 */
export const groupByMonth = (measurements: any[]): any[] => {
  const monthMap: { [month: string]: { monthDate: Date, total: number, count: number } } = {};
  
  for (const m of measurements) {
    if (!m.timestamp) continue;
    
    const d = new Date(m.timestamp);
    const monthStr = format(d, "yyyy-MM");
    
    if (!monthMap[monthStr]) {
      monthMap[monthStr] = { 
        monthDate: new Date(d.getFullYear(), d.getMonth(), 1), 
        total: 0, 
        count: 0 
      };
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
};
