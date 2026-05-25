import { useMemo } from 'react';
import { PeriodRecord, CycleSettings } from '../types';
import { analyzeCycle } from '../utils/analysis';
import { parseDate } from '../utils/date';

interface AnalysisProps {
  records: PeriodRecord[];
  settings: CycleSettings;
}

export default function Analysis({ records, settings }: AnalysisProps) {
  const analysis = useMemo(() => analyzeCycle(records, settings), [records, settings]);

  const periodRecords = useMemo(() => 
    records.filter(r => r.isPeriod).sort((a, b) => a.date.localeCompare(b.date)), 
    [records]
  );

  const recentPeriods = useMemo(() => {
    if (periodRecords.length === 0) return [];
    
    const periods: { start: string; end: string; days: number }[] = [];
    let currentStart = periodRecords[0].date;
    let currentEnd = periodRecords[0].date;

    for (let i = 1; i < periodRecords.length; i++) {
      const prevDate = parseDate(periodRecords[i - 1].date);
      const currDate = parseDate(periodRecords[i].date);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        currentEnd = periodRecords[i].date;
      } else {
        const startDate = parseDate(currentStart);
        const endDate = parseDate(currentEnd);
        periods.push({
          start: currentStart,
          end: currentEnd,
          days: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        });
        currentStart = periodRecords[i].date;
        currentEnd = periodRecords[i].date;
      }
    }
    
    const startDate = parseDate(currentStart);
    const endDate = parseDate(currentEnd);
    periods.push({
      start: currentStart,
      end: currentEnd,
      days: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    });

    return periods.slice(-6);
  }, [periodRecords]);

  const averagePeriodDays = useMemo(() => {
    if (recentPeriods.length === 0) return 0;
    const sum = recentPeriods.reduce((acc, p) => acc + p.days, 0);
    return Math.round(sum / recentPeriods.length);
  }, [recentPeriods]);

  return (
    <div className="analysis">
      <div className="analysis-section">
        <div className="section-title">
          <span className="icon">📊</span>
          <span>经期变化</span>
        </div>
        
        <div className="stat-card">
          <div className="stat-item">
            <div className="stat-label">本次经期</div>
            <div className="stat-value">
              <span className="number">{analysis.periodDaysInCurrentMonth}</span>
              <span className="unit">天</span>
              <span className="status normal">正常</span>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-label">和上个周期</div>
            <div className="stat-value">
              <span className="text">相同</span>
            </div>
          </div>
        </div>

        <div className="section-info">
          近半年经期天数 {averagePeriodDays}±1天
        </div>

        <div className="chart-container">
          <div className="chart-bars">
            {recentPeriods.map((period, index) => {
              const date = parseDate(period.start);
              const label = `${date.getMonth() + 1}/${date.getDate()}`;
              const maxDays = Math.max(...recentPeriods.map(p => p.days), 1);
              const heightPercent = (period.days / maxDays) * 100;
              return (
                <div key={index} className="bar-item">
                  <div className="bar-wrapper">
                    <div 
                      className="bar" 
                      style={{ height: `${heightPercent}%` }}
                    >
                      <span className="bar-value">{period.days}</span>
                    </div>
                  </div>
                  <div className="bar-label">{label}</div>
                </div>
              );
            })}
          </div>
          <div className="chart-range">
            <span>正常范围 2-7天</span>
          </div>
        </div>
      </div>

      <div className="analysis-section">
        <div className="section-title">
          <span className="icon">🔄</span>
          <span>周期变化</span>
        </div>

        <div className="section-info">
          最近1个周期 ({analysis.lastPeriodStart ? parseDate(analysis.lastPeriodStart).toLocaleDateString('zh-CN') : '-'})
        </div>

        <div className="stat-card">
          <div className="stat-item">
            <div className="stat-label">周期天数</div>
            <div className="stat-value">
              <span className="number">{analysis.averageCycleLength}</span>
              <span className="unit">天</span>
              <span className="status normal">正常</span>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-label">和前1个周期</div>
            <div className="stat-value">
              <span className="text">相同</span>
            </div>
          </div>
        </div>

        <div className="section-info">
          近半年周期天数 {analysis.averageCycleLength}±1天
          <span className="status-tag">规律</span>
        </div>

        <div className="cycle-list">
          {[...analysis.cycleHistory].reverse().map((cycle, index) => {
            const startDate = parseDate(cycle.startDate);
            const isFirst = index === 0;
            
            const getDeviationText = () => {
              if (cycle.deviation === 0) return '正常';
              if (cycle.deviation > 0) return `推迟${cycle.deviation}天`;
              return `提前${Math.abs(cycle.deviation)}天`;
            };
            
            const getDeviationClass = () => {
              if (cycle.deviation === 0) return 'normal';
              if (cycle.deviation > 0) return 'delayed';
              return 'advanced';
            };
            
            return (
              <div key={index} className={`cycle-item ${isFirst ? 'current' : ''}`}>
                {isFirst && (
                  <div className="current-label">本周期</div>
                )}
                <div className="cycle-date">
                  {startDate.getMonth() + 1}月{startDate.getDate()}日
                </div>
                <div className="cycle-bar-container">
                  <div className="cycle-bar">
                    <div 
                      className="cycle-fill" 
                      style={{ width: `${(cycle.length / 35) * 100}%` }}
                    >
                      <span className="cycle-bar-text">{cycle.length}天</span>
                    </div>
                  </div>
                </div>
                <div className={`cycle-deviation ${getDeviationClass()}`}>
                  {getDeviationText()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="cycle-range">
          正常范围 21-35天
        </div>
      </div>
    </div>
  );
}
