export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDate = (dateStr: string): Date => {
  if (!dateStr || typeof dateStr !== 'string') {
    return new Date();
  }
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return new Date();
  }
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date();
  }
  return new Date(year, month - 1, day);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const getMonthName = (month: number): string => {
  const names = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return names[month];
};

export const getWeekDayName = (day: number): string => {
  const names = ['日', '一', '二', '三', '四', '五', '六'];
  return names[day];
};

export const isToday = (dateStr: string): boolean => {
  return dateStr === formatDate(new Date());
};

export const getNextCycleDate = (lastPeriodDate: string, cycleLength: number): string => {
  const date = parseDate(lastPeriodDate);
  date.setDate(date.getDate() + cycleLength);
  return formatDate(date);
};

export const getPredictedPeriodDates = (lastPeriodDate: string, cycleLength: number, periodLength: number): string[] => {
  const dates: string[] = [];
  for (let cycle = 1; cycle <= 3; cycle++) {
    const nextDate = parseDate(getNextCycleDate(lastPeriodDate, cycleLength * cycle));
    for (let i = 0; i < periodLength; i++) {
      const d = new Date(nextDate);
      d.setDate(d.getDate() + i);
      dates.push(formatDate(d));
    }
  }
  return dates;
};

export const getOvulationDates = (lastPeriodDate: string, cycleLength: number): string[] => {
  const dates: string[] = [];
  for (let cycle = 1; cycle <= 3; cycle++) {
    const ovulationDate = parseDate(getNextCycleDate(lastPeriodDate, cycleLength * cycle));
    ovulationDate.setDate(ovulationDate.getDate() - 14);
    
    for (let i = -5; i <= 4; i++) {
      const d = new Date(ovulationDate);
      d.setDate(d.getDate() + i);
      dates.push(formatDate(d));
    }
  }
  return dates;
};
