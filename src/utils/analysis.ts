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
  deviation: number | undefined;
  isCurrent: boolean;
}

export const analyzeCycle = (records: PeriodRecord[] = [], settings: CycleSettings): CycleAnalysis => {
  if (!records || !Array.isArray(records)) {
    return {
      currentCycleDays: 0,
      averageCycleLength: settings.cycleLength,
      averagePeriodLength: settings.periodLength,
      lastPeriodStart: null,
      nextPeriodPrediction: null,
      periodDaysInCurrentMonth: 0,
      cycleHistory: [],
    };
  }
  
  const periodRecords = records.filter(r => r && r.isPeriod).sort((a, b) => a.date.localeCompare(b.date));
  
  const cycleHistory = extractCycles(periodRecords, settings.cycleLength);
  const averageCycleLength = cycleHistory.length > 0
    ? Math.round(cycleHistory.reduce((sum, c) => sum + c.length, 0) / cycleHistory.length)
    : settings.cycleLength;
  
  const periodLengths = cycleHistory.map(c => {
    if (!c.startDate || !c.endDate) return 0;
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }).filter(l => l > 0);
  const averagePeriodLength = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((sum, l) => sum + l, 0) / periodLengths.length)
    : settings.periodLength;
  
  const lastPeriodStart = (() => {
    if (periodRecords.length === 0) return null;
    
    let startDate = periodRecords[periodRecords.length - 1].date;
    
    for (let i = periodRecords.length - 1; i > 0; i--) {
      const currDate = new Date(periodRecords[i].date);
      const prevDate = new Date(periodRecords[i - 1].date);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 2) {
        break;
      }
      startDate = periodRecords[i - 1].date;
    }
    
    return startDate;
  })();
  
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
    cycleHistory,
  };
};

const extractCycles = (periodRecords: PeriodRecord[], userCycleLength: number): CycleInfo[] => {
  if (!periodRecords || periodRecords.length === 0) return [];
  
  const cycles: CycleInfo[] = [];
  const sortedRecords = [...periodRecords].sort((a, b) => a.date.localeCompare(b.date));
  let currentPeriodStart = sortedRecords[0].date;
  
  for (let i = 1; i < sortedRecords.length; i++) {
    const prevDate = new Date(sortedRecords[i - 1].date);
    const currDate = new Date(sortedRecords[i].date);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 2) {
    } else {
      const cycleStartDate = new Date(currentPeriodStart);
      const nextPeriodStartDate = new Date(sortedRecords[i].date);
      const cycleLength = Math.round((nextPeriodStartDate.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      cycles.push({
        startDate: currentPeriodStart,
        endDate: sortedRecords[i - 1].date,
        length: cycleLength,
        deviation: 0,
        isCurrent: false,
      });
      
      currentPeriodStart = sortedRecords[i].date;
    }
  }
  
  if (cycles.length >= 1) {
    const avgLength = Math.round(cycles.reduce((sum, c) => sum + c.length, 0) / cycles.length);
    const referenceLength = userCycleLength > 0 ? userCycleLength : avgLength;
    
    let lastPeriodStart = periodRecords[0].date;
    
    cycles.forEach((cycle, index) => {
      if (index === 0) {
        cycle.deviation = undefined;
      } else {
        const lastStartDate = new Date(lastPeriodStart);
        const predictedNextStart = new Date(lastStartDate);
        predictedNextStart.setDate(predictedNextStart.getDate() + referenceLength);
        
        const actualNextStart = new Date(cycle.startDate);
        
        const deviationDays = Math.round((actualNextStart.getTime() - predictedNextStart.getTime()) / (1000 * 60 * 60 * 24));
        cycle.deviation = deviationDays;
      }
      
      lastPeriodStart = cycle.startDate;
    });
  }
  
  const lastPeriodStartDate = (() => {
    if (sortedRecords.length === 0) return '';
    
    let startDate = sortedRecords[sortedRecords.length - 1].date;
    
    for (let i = sortedRecords.length - 1; i > 0; i--) {
      const currDate = new Date(sortedRecords[i].date);
      const prevDate = new Date(sortedRecords[i - 1].date);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 2) {
        break;
      }
      startDate = sortedRecords[i - 1].date;
    }
    
    return startDate;
  })();
  
  if (lastPeriodStartDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastStart = new Date(lastPeriodStartDate);
    lastStart.setHours(0, 0, 0, 0);
    
    if (today >= lastStart) {
      const avgLength = cycles.length > 0 
        ? Math.round(cycles.reduce((sum, c) => sum + c.length, 0) / cycles.length)
        : userCycleLength;
      const referenceLength = userCycleLength > 0 ? userCycleLength : avgLength;
      
      const currentCycleDays = Math.round((today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
      
      let deviation: number | undefined = undefined;
      if (cycles.length > 0) {
        const lastCycleStart = new Date(cycles[cycles.length - 1].startDate);
        const predictedNextStart = new Date(lastCycleStart);
        predictedNextStart.setDate(predictedNextStart.getDate() + referenceLength);
        const actualStart = new Date(lastPeriodStartDate);
        deviation = Math.round((actualStart.getTime() - predictedNextStart.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      cycles.push({
        startDate: lastPeriodStartDate,
        endDate: '',
        length: currentCycleDays,
        deviation,
        isCurrent: true,
      });
    }
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
