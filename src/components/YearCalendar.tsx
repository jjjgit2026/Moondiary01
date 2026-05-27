import { useState } from 'react';
import { PeriodRecord } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, getMonthName, isToday } from '../utils/date';

interface YearCalendarProps {
  records: PeriodRecord[];
  currentYear: number;
  onBack: () => void;
}

export default function YearCalendar({ records, currentYear, onBack }: YearCalendarProps) {
  const [year, setYear] = useState(currentYear);

  const handlePrevYear = () => {
    setYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setYear(prev => prev + 1);
  };

  const renderMonth = (month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${month}-${i}`} className="year-cal-day empty" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isPeriod = records.some(r => r.date === dateStr && r.isPeriod);
      const isTodayFlag = isToday(dateStr);

      days.push(
        <div
          key={`${year}-${month}-${i}`}
          className={`year-cal-day ${isPeriod ? 'period' : ''} ${isTodayFlag ? 'today' : ''}`}
        >
          {i}
        </div>
      );
    }

    return (
      <div key={month} className="year-cal-month">
        <div className="year-cal-month-header">
          <span className="year-cal-month-name">{getMonthName(month)}</span>
        </div>
        <div className="year-cal-weekdays">
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <div key={day} className="year-cal-weekday">{day}</div>
          ))}
        </div>
        <div className="year-cal-days">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="year-cal-container">
      <div className="year-cal-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="year-nav">
          <button className="nav-btn" onClick={handlePrevYear}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="year-title">{year}年</span>
          <button className="nav-btn" onClick={handleNextYear}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="year-cal-content">
        {Array.from({ length: 12 }, (_, i) => renderMonth(i))}
      </div>

      <div className="year-cal-legend">
        <div className="legend-item">
          <span className="legend-dot period" />
          <span>经期</span>
        </div>
      </div>
    </div>
  );
}
