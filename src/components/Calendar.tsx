import { useState, useMemo } from 'react';
import { PeriodRecord, CycleSettings } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, getMonthName, isToday, parseDate } from '../utils/date';
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

const getDaysUntilNextPeriod = (lastPeriodDate: string | null, cycleLength: number): number | null => {
  if (!lastPeriodDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastDate = parseDate(lastPeriodDate);
  const nextPeriodDate = new Date(lastDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
  
  if (nextPeriodDate < today) {
    const daysSinceExpected = Math.floor((today.getTime() - nextPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
    const cyclesToAdd = Math.floor(daysSinceExpected / cycleLength) + 1;
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cyclesToAdd * cycleLength);
  }
  
  const diffDays = Math.floor((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getPeriodReminder = (daysUntil: number): { message: string; symptoms: string[]; tips: string[] } | null => {
  if (daysUntil === 3) {
    return {
      message: '还有3天就要来月经啦',
      symptoms: ['乳房胀痛', '情绪波动', '轻微腹痛'],
      tips: ['开始准备卫生巾', '避免生冷食物', '保持充足睡眠']
    };
  } else if (daysUntil === 2) {
    return {
      message: '还有2天就要来月经啦',
      symptoms: ['腰酸背痛', '疲劳乏力', '食欲改变'],
      tips: ['注意保暖', '减少剧烈运动', '多喝水']
    };
  } else if (daysUntil === 1) {
    return {
      message: '明天就要来月经啦',
      symptoms: ['小腹坠胀', '情绪烦躁', '头痛'],
      tips: ['准备好经期用品', '饮食清淡', '放松心情']
    };
  }
  return null;
};

export default function Calendar({ records, settings, onDateClick, onMonthClick, canShowPrediction = false }: CalendarProps) {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<TermType | null>(null);

  const lastPeriodDate = useMemo(() => {
    const periodRecords = records.filter(r => r.isPeriod).sort((a, b) => a.date.localeCompare(b.date));
    if (periodRecords.length === 0) return null;
    
    for (let i = periodRecords.length - 1; i >= 0; i--) {
      const currentDate = parseDate(periodRecords[i].date);
      if (i === 0) return periodRecords[i].date;
      
      const prevDate = parseDate(periodRecords[i - 1].date);
      const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        return periodRecords[i].date;
      }
    }
    
    return periodRecords[0].date;
  }, [records]);

  const daysUntilNextPeriod = useMemo(() => {
    if (!canShowPrediction || !lastPeriodDate) return null;
    return getDaysUntilNextPeriod(lastPeriodDate, settings.cycleLength);
  }, [canShowPrediction, lastPeriodDate, settings.cycleLength]);

  const periodReminder = useMemo(() => {
    if (daysUntilNextPeriod === null || daysUntilNextPeriod > 3 || daysUntilNextPeriod < 0) return null;
    return getPeriodReminder(daysUntilNextPeriod);
  }, [daysUntilNextPeriod]);

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

      {periodReminder && (
        <div className="period-reminder">
          <div className="reminder-header">
            <span className="reminder-icon">🔔</span>
            <span className="reminder-message">{periodReminder.message}</span>
          </div>
          <div className="reminder-content">
            <div className="reminder-section">
              <span className="section-label">可能出现的症状：</span>
              <div className="tag-list">
                {periodReminder.symptoms.map((symptom, index) => (
                  <span key={index} className="tag symptom-tag">{symptom}</span>
                ))}
              </div>
            </div>
            <div className="reminder-section">
              <span className="section-label">温馨提示：</span>
              <div className="tag-list">
                {periodReminder.tips.map((tip, index) => (
                  <span key={index} className="tag tip-tag">{tip}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
                {(() => {
                  const record = records.find(r => r.date === item.date);
                  if (record && (record.flow || record.symptoms && record.symptoms.length > 0 || record.mood || record.note)) {
                    return <span className="record-indicator" />;
                  }
                  return null;
                })()}
                {(() => {
                  const record = records.find(r => r.date === item.date);
                  if (record && record.weight !== undefined && record.weight !== null) {
                    return (
                      <span className="weight-indicator" title={`体重: ${record.weight}kg`}>
                        {record.weight}
                      </span>
                    );
                  }
                  return null;
                })()}
              </>
            )}
          </button>
        ))}
      </div>

      <div className="legend">
        {records.length === 0 ? (
          <div className="legend-item">
            <span className="legend-dot period" />
            <span className="legend-text">点击任意日期设置月经状态</span>
          </div>
        ) : (
          <div className="legend-item" onClick={() => handleTermClick('period')}>
            <span className="legend-dot period" />
            <span className="legend-text">月经期</span>
            {!canShowPrediction && (
              <svg className="legend-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        )}
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
