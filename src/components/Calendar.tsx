import { useState, useMemo } from 'react';
import { PeriodRecord, CycleSettings } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, getMonthName, isToday } from '../utils/date';
import { getPredictedPeriodDates, getOvulationDates } from '../utils/date';
import TermExplanation from './TermExplanation';

interface CalendarProps {
  records: PeriodRecord[];
  settings: CycleSettings;
  onDateClick: (date: string) => void;
  onMonthClick: () => void;
  canShowPrediction?: boolean;
}

type TermType = 'period' | 'predicted' | 'ovulation' | 'ovulation-day';

export default function Calendar({ records, settings, onDateClick, onMonthClick, canShowPrediction = false }: CalendarProps) {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<TermType | null>(null);

  const lastPeriodDate = useMemo(() => {
    const periodRecords = records.filter(r => r.isPeriod).sort((a, b) => b.date.localeCompare(a.date));
    return periodRecords.length > 0 ? periodRecords[0].date : null;
  }, [records]);

  const predictedPeriodDates = useMemo(() => {
    if (!canShowPrediction || !lastPeriodDate) return [];
    return getPredictedPeriodDates(lastPeriodDate, settings.cycleLength, settings.periodLength);
  }, [canShowPrediction, lastPeriodDate, settings]);

  const ovulationDates = useMemo(() => {
    if (!canShowPrediction || !lastPeriodDate) return [];
    return getOvulationDates(lastPeriodDate, settings.cycleLength);
  }, [canShowPrediction, lastPeriodDate, settings.cycleLength]);

  const ovulationDay = useMemo(() => {
    if (!canShowPrediction || !lastPeriodDate) return null;
    const dates = getOvulationDates(lastPeriodDate, settings.cycleLength);
    return dates[5];
  }, [canShowPrediction, lastPeriodDate, settings.cycleLength]);

  const days = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const result: { date: string; day: number; isEmpty: boolean }[] = [];

    for (let i = 0; i < firstDay; i++) {
      result.push({ date: '', day: 0, isEmpty: true });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      result.push({
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        day: i,
        isEmpty: false,
      });
    }

    return result;
  }, [currentYear, currentMonth]);

  const getDayStyle = (date: string) => {
    const styles: string[] = [];
    
    if (!date) {
      styles.push('empty');
      return styles;
    }

    const record = records.find(r => r.date === date);
    const isPeriod = record?.isPeriod;
    const isPredicted = predictedPeriodDates.includes(date);
    const isOvulation = ovulationDates.includes(date);
    const isOvulationDay = date === ovulationDay;
    const isTodayFlag = isToday(date);

    if (isPeriod) {
      styles.push('period');
    } else if (isPredicted) {
      styles.push('predicted');
    } else if (isOvulationDay) {
      styles.push('ovulation-day');
    } else if (isOvulation) {
      styles.push('ovulation');
    }

    if (isTodayFlag) {
      styles.push('today');
    }

    return styles;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleTermClick = (term: TermType) => {
    setSelectedTerm(term);
    setShowTermModal(true);
  };

  const handleCloseTermModal = () => {
    setShowTermModal(false);
    setSelectedTerm(null);
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="nav-btn" onClick={handlePrevMonth}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="month-year" onClick={onMonthClick}>
          <span className="month">{getMonthName(currentMonth)}</span>
          <span className="year">{currentYear}</span>
          <svg className="month-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button className="nav-btn" onClick={handleNextMonth}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="weekdays">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="days">
        {days.map((item, index) => (
          <button
            key={index}
            className={`day ${getDayStyle(item.date).join(' ')}`}
            onClick={() => !item.isEmpty && onDateClick(item.date)}
          >
            {!item.isEmpty && (
              <>
                <span className="day-number">{item.day}</span>
                {records.find(r => r.date === item.date)?.isPeriod && (
                  <span className="period-indicator" />
                )}
                {item.date === ovulationDay && (
                  <span className="ovulation-indicator" />
                )}
              </>
            )}
          </button>
        ))}
      </div>

      <div className="legend">
        <div className="legend-item" onClick={() => handleTermClick('period')}>
          <span className="legend-dot period" />
          <span className="legend-text">月经期</span>
          {!canShowPrediction && (
            <svg className="legend-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
        {canShowPrediction && (
          <>
            <div className="legend-item" onClick={() => handleTermClick('predicted')}>
              <span className="legend-dot predicted" />
              <span className="legend-text">预测经期</span>
            </div>
            <div className="legend-item" onClick={() => handleTermClick('ovulation')}>
              <span className="legend-dot ovulation" />
              <span className="legend-text">排卵期</span>
            </div>
            <div className="legend-item" onClick={() => handleTermClick('ovulation-day')}>
              <span className="legend-dot ovulation-day" />
              <span className="legend-text">排卵日</span>
              <svg className="legend-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </>
        )}
      </div>

      {showTermModal && selectedTerm && (
        <TermExplanation term={selectedTerm} onClose={handleCloseTermModal} />
      )}
    </div>
  );
}
