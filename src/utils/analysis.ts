import { PeriodRecord, CycleSettings } from '../types';

export interface CycleAnalysis {
  currentCycleDays: number;
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodStart: string | null;
  nextPeriodPrediction: string | null;
  periodDaysInCurrentMonth: number;
  cycleHistory: CycleInfo[];
}

export interface CycleInfo {
  startDate: string;
  endDate: string;
  length: number;
  deviation: number;
}

export const analyzeCycle = (records: PeriodRecord[], settings: CycleSettings): CycleAnalysis => {
  const periodRecords = records.filter(r => r.isPeriod).sort((a, b) => a.date.localeCompare(b.date));
  
  const cycleHistory = extractCycles(periodRecords);
  const averageCycleLength = cycleHistory.length > 0
    ? Math.round(cycleHistory.reduce((sum, c) => sum + c.length, 0) / cycleHistory.length)
    : settings.cycleLength;
  
  const periodLengths = cycleHistory.map(c => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  });
  const averagePeriodLength = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((sum, l) => sum + l, 0) / periodLengths.length)
    : settings.periodLength;
  
  const lastPeriodStart = periodRecords.length > 0 ? periodRecords[periodRecords.length - 1].date : null;
  
  let nextPeriodPrediction: string | null = null;
  let currentCycleDays = 0;
  if (lastPeriodStart) {
    const lastDate = new Date(lastPeriodStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    currentCycleDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const nextDate = new Date(lastPeriodStart);
    nextDate.setDate(nextDate.getDate() + averageCycleLength);
    nextPeriodPrediction = nextDate.toISOString().split('T')[0];
  }
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const periodDaysInCurrentMonth = periodRecords.filter(r => r.date.startsWith(currentMonth)).length;
  
  return {
    currentCycleDays,
    averageCycleLength,
    averagePeriodLength,
    lastPeriodStart,
    nextPeriodPrediction,
    periodDaysInCurrentMonth,
    cycleHistory: cycleHistory.slice(-6),
  };
};

const extractCycles = (periodRecords: PeriodRecord[]): CycleInfo[] => {
  if (periodRecords.length === 0) return [];
  
  const cycles: CycleInfo[] = [];
  let currentEnd = periodRecords[0].date;
  
  for (let i = 1; i < periodRecords.length; i++) {
    const prevDate = new Date(periodRecords[i - 1].date);
    const currDate = new Date(periodRecords[i].date);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 2) {
      currentEnd = periodRecords[i].date;
    } else {
      const endDate = new Date(currentEnd);
      const nextCycleStart = new Date(endDate);
      nextCycleStart.setDate(nextCycleStart.getDate() + 1);
      const cycleEnd = new Date(periodRecords[i].date);
      cycleEnd.setDate(cycleEnd.getDate() - 1);
      
      if (nextCycleStart <= cycleEnd) {
        const cycleLength = Math.round((cycleEnd.getTime() - nextCycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        cycles.push({
          startDate: nextCycleStart.toISOString().split('T')[0],
          endDate: cycleEnd.toISOString().split('T')[0],
          length: cycleLength,
          deviation: 0,
        });
      }
      
      currentEnd = periodRecords[i].date;
    }
  }
  
  if (cycles.length >= 2) {
    const avgLength = Math.round(cycles.reduce((sum, c) => sum + c.length, 0) / cycles.length);
    cycles.forEach((cycle, index) => {
      if (index > 0) {
        cycle.deviation = cycle.length - cycles[index - 1].length;
      } else {
        cycle.deviation = cycle.length - avgLength;
      }
    });
  }
  
  return cycles;
};

export const calculateHealthScore = (analysis: CycleAnalysis): number => {
  let score = 100;
  
  if (analysis.cycleHistory.length < 3) {
    score -= 20;
  }
  
  const cycleVariance = analysis.cycleHistory.reduce((sum, c) => {
    const diff = Math.abs(c.length - analysis.averageCycleLength);
    return sum + diff;
  }, 0) / (analysis.cycleHistory.length || 1);
  
  if (cycleVariance > 3) {
    score -= Math.min(cycleVariance * 5, 30);
  }
  
  if (analysis.averageCycleLength < 21 || analysis.averageCycleLength > 35) {
    score -= 20;
  }
  
  if (analysis.averagePeriodLength < 2 || analysis.averagePeriodLength > 7) {
    score -= 10;
  }
  
  return Math.max(0, Math.round(score));
};
