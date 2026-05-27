import { useMemo, useState } from 'react';
import { PeriodRecord, CycleSettings } from '../types';
import { analyzeCycle } from '../utils/analysis';
import { parseDate } from '../utils/date';

interface AnalysisProps {
  records: PeriodRecord[];
  settings: CycleSettings;
  birthYear: number;
}

const MAX_VISIBLE_ITEMS = 6;

export default function Analysis({ records, settings, birthYear }: AnalysisProps) {
  const analysis = useMemo(() => analyzeCycle(records, settings), [records, settings]);
  const [showAllPeriods, setShowAllPeriods] = useState(false);
  const [showAllCycles, setShowAllCycles] = useState(false);

  const periodRecords = useMemo(() => 
    records.filter(r => r.isPeriod).sort((a, b) => a.date.localeCompare(b.date)), 
    [records]
  );

  const isInPeriod = useMemo(() => {
    if (periodRecords.length === 0) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastPeriodDate = parseDate(periodRecords[periodRecords.length - 1].date);
    lastPeriodDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays === 0;
  }, [periodRecords]);

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

  const periodDaysStdDev = useMemo(() => {
    if (recentPeriods.length < 2) return 1;
    const mean = averagePeriodDays;
    const variance = recentPeriods.reduce((acc, p) => acc + Math.pow(p.days - mean, 2), 0) / (recentPeriods.length - 1);
    return Math.round(Math.sqrt(variance)) || 1;
  }, [recentPeriods, averagePeriodDays]);

  const cycleLengthStdDev = useMemo(() => {
    if (analysis.cycleHistory.length < 2) return 1;
    const mean = analysis.averageCycleLength;
    const variance = analysis.cycleHistory.reduce((acc, c) => acc + Math.pow(c.length - mean, 2), 0) / (analysis.cycleHistory.length - 1);
    return Math.round(Math.sqrt(variance)) || 1;
  }, [analysis.cycleHistory, analysis.averageCycleLength]);

  const weightRecords = useMemo(() => {
    return records
      .filter(r => r.weight !== undefined && r.weight !== null)
      .map(r => ({
        date: r.date,
        weight: r.weight as number
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);

  const weightTrend = useMemo(() => {
    if (weightRecords.length < 2) return null;
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentWeightRecords = weightRecords.filter(r => parseDate(r.date) >= threeMonthsAgo);
    
    if (recentWeightRecords.length < 2) return null;
    
    const firstWeight = recentWeightRecords[0].weight;
    const lastWeight = recentWeightRecords[recentWeightRecords.length - 1].weight;
    const allWeights = recentWeightRecords.map(r => r.weight);
    const maxWeight = Math.max(...allWeights);
    const minWeight = Math.min(...allWeights);
    const avgWeight = allWeights.reduce((a, b) => a + b, 0) / allWeights.length;
    const variance = allWeights.reduce((acc, w) => acc + Math.pow(w - avgWeight, 2), 0) / allWeights.length;
    const stdDev = Math.sqrt(variance);
    
    const changePercent = ((lastWeight - firstWeight) / firstWeight) * 100;
    const maxChangePercent = ((maxWeight - minWeight) / firstWeight) * 100;
    
    const movingAverages = recentWeightRecords.map((_, index) => {
      const windowSize = Math.min(7, index + 1);
      const startIdx = index - windowSize + 1;
      const window = recentWeightRecords.slice(Math.max(0, startIdx), index + 1);
      const avg = window.reduce((acc, r) => acc + r.weight, 0) / window.length;
      return {
        date: recentWeightRecords[index].date,
        weight: Math.round(avg * 10) / 10
      };
    });
    
    return {
      records: recentWeightRecords,
      movingAverages,
      changePercent: Math.round(changePercent * 10) / 10,
      maxChangePercent: Math.round(maxChangePercent * 10) / 10,
      firstWeight,
      lastWeight,
      maxWeight,
      minWeight,
      avgWeight: Math.round(avgWeight * 10) / 10,
      stdDev: Math.round(stdDev * 10) / 10
    };
  }, [weightRecords]);

  const isAdult = useMemo(() => {
    const age = new Date().getFullYear() - birthYear;
    return age >= 18;
  }, [birthYear]);

  const weightReminder = useMemo(() => {
    if (!isAdult || !weightTrend || weightRecords.length < 5) return null;
    
    const { changePercent, maxChangePercent } = weightTrend;
    
    if (Math.abs(maxChangePercent) <= 10) {
      return {
        type: 'positive',
        message: `体重保持得很好！近3个月体重变化仅${Math.abs(changePercent).toFixed(1)}%，继续保持健康的生活方式哦 💪`
      };
    }
    
    const isIncreasing = changePercent > 0;
    const hasConsistentTrend = Math.abs(changePercent) / maxChangePercent > 0.7;
    
    if (hasConsistentTrend) {
      return {
        type: 'warning',
        message: `近3个月体重${isIncreasing ? '持续增加' : '持续减少'}${Math.abs(changePercent).toFixed(1)}%，建议关注饮食和运动，适当控制体重变化幅度 🥗`
      };
    }
    
    return null;
  }, [isAdult, weightTrend, weightRecords.length]);

  const reminders = useMemo(() => {
    const result: { type: string; message: string }[] = [];
    
    if (recentPeriods.length >= 3) {
      const lastThreePeriods = recentPeriods.slice(-3);
      const maxDiff = Math.max(...lastThreePeriods.map(p => p.days)) - Math.min(...lastThreePeriods.map(p => p.days));
      const avgActualDays = Math.round(lastThreePeriods.reduce((acc, p) => acc + p.days, 0) / 3);
      
      if (maxDiff <= 2 && Math.abs(avgActualDays - settings.periodLength) >= 1) {
        result.push({
          type: 'period',
          message: `您最近3个月的经期时长很稳定（平均${avgActualDays}天），与当前设置的${settings.periodLength}天不一致，建议修改经期设置为${avgActualDays}天，以获得更准确的预测`
        });
      }
    }

    const completedCycles = analysis.cycleHistory.filter(c => !c.isCurrent);
    if (completedCycles.length >= 3) {
      const lastThreeCycles = completedCycles.slice(-3);
      const maxDiff = Math.max(...lastThreeCycles.map(c => c.length)) - Math.min(...lastThreeCycles.map(c => c.length));
      const avgActualCycle = Math.round(lastThreeCycles.reduce((acc, c) => acc + c.length, 0) / 3);
      
      if (maxDiff <= 3 && Math.abs(avgActualCycle - settings.cycleLength) >= 1) {
        result.push({
          type: 'cycle',
          message: `您最近3个周期的时长很规律（平均${avgActualCycle}天），与当前设置的${settings.cycleLength}天不一致，建议修改周期设置为${avgActualCycle}天，以获得更准确的预测`
        });
      }
    }

    return result;
  }, [recentPeriods, settings.periodLength, analysis.cycleHistory, settings.cycleLength]);

  return (
    <div className="analysis">
      {reminders.length > 0 && (
        <div className="reminder-section">
          {reminders.map((reminder, index) => (
            <div key={index} className="reminder-card">
              <span className="reminder-icon">💡</span>
              <span className="reminder-text">{reminder.message}</span>
            </div>
          ))}
        </div>
      )}
      
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
              {(() => {
                const days = analysis.periodDaysInCurrentMonth;
                const isAbnormal = days < 2 || days > 7;
                const shouldMarkAbnormal = !(isInPeriod && days < 2);
                
                if (!shouldMarkAbnormal || !isAbnormal) {
                  return (
                    <span className={`status ${days >= 2 && days <= 7 ? 'normal' : 'abnormal'}`}>
                      {days >= 2 && days <= 7 ? '正常' : '异常'}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>

        <div className="section-info">
          近半年经期天数 {averagePeriodDays}±{periodDaysStdDev}天
        </div>

        <div className="chart-container">
          <div className="chart-range">
            <span>正常范围 2-7天</span>
          </div>
          <div className="chart-bars">
            {(showAllPeriods ? recentPeriods : recentPeriods.slice(0, MAX_VISIBLE_ITEMS)).map((period, index) => {
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
          {recentPeriods.length > MAX_VISIBLE_ITEMS && (
            <button 
              className="view-more-btn" 
              onClick={() => setShowAllPeriods(!showAllPeriods)}
            >
              {showAllPeriods ? '收起' : `查看更多 (${recentPeriods.length - MAX_VISIBLE_ITEMS})`}
            </button>
          )}
        </div>
      </div>

      <div className="analysis-section">
        <div className="section-title">
          <span className="icon">🔄</span>
          <span>周期变化</span>
        </div>

        <div className="section-info">
          最近1个周期 ({(() => {
            const completedCycles = analysis.cycleHistory.filter(c => !c.isCurrent);
            const latestCycle = completedCycles.length > 0 ? completedCycles[completedCycles.length - 1] : null;
            if (latestCycle && latestCycle.startDate) {
              const start = parseDate(latestCycle.startDate);
              const nextCycleStart = parseDate(analysis.lastPeriodStart || '');
              const end = new Date(nextCycleStart);
              end.setDate(end.getDate() - 1);
              return `${start.getFullYear()}/${start.getMonth() + 1}/${start.getDate()}-${end.getFullYear()}/${end.getMonth() + 1}/${end.getDate()}`;
            }
            return analysis.lastPeriodStart ? parseDate(analysis.lastPeriodStart).toLocaleDateString('zh-CN') : '-';
          })()})
        </div>

        <div className="stat-card">
          <div className="stat-item">
            <div className="stat-label">周期天数</div>
            <div className="stat-value">
              <span className="number">{analysis.cycleHistory.length > 0 ? analysis.cycleHistory.filter(c => !c.isCurrent).pop()?.length || analysis.cycleHistory[analysis.cycleHistory.length - 1].length : analysis.averageCycleLength}</span>
              <span className="unit">天</span>
              <span className={`status ${(analysis.cycleHistory.length > 0 ? analysis.cycleHistory.filter(c => !c.isCurrent).pop()?.length || analysis.cycleHistory[analysis.cycleHistory.length - 1].length : analysis.averageCycleLength) >= 21 && (analysis.cycleHistory.length > 0 ? analysis.cycleHistory.filter(c => !c.isCurrent).pop()?.length || analysis.cycleHistory[analysis.cycleHistory.length - 1].length : analysis.averageCycleLength) <= 35 ? 'normal' : 'abnormal'}`}>
                {(analysis.cycleHistory.length > 0 ? analysis.cycleHistory.filter(c => !c.isCurrent).pop()?.length || analysis.cycleHistory[analysis.cycleHistory.length - 1].length : analysis.averageCycleLength) >= 21 && (analysis.cycleHistory.length > 0 ? analysis.cycleHistory.filter(c => !c.isCurrent).pop()?.length || analysis.cycleHistory[analysis.cycleHistory.length - 1].length : analysis.averageCycleLength) <= 35 ? '正常' : '异常'}
              </span>
            </div>
          </div>
        </div>

        <div className="section-info">
          近半年周期天数 {analysis.averageCycleLength}±{cycleLengthStdDev}天
          {analysis.cycleHistory.length >= 2 && (
            <span className={`status-tag ${cycleLengthStdDev <= 7 ? '' : 'abnormal'}`}>{cycleLengthStdDev <= 7 ? '规律' : '不规律'}</span>
          )}
        </div>

        <div className="cycle-list">
          {analysis.cycleHistory && analysis.cycleHistory.length > 0 ? (
            (() => {
              const cycles = [...analysis.cycleHistory].reverse();
              const displayCycles = showAllCycles ? cycles : cycles.slice(0, MAX_VISIBLE_ITEMS);
              return displayCycles.map((cycle, index) => {
                if (!cycle || !cycle.startDate || typeof cycle.length !== 'number') {
                  return null;
                }
                
                const startDate = parseDate(cycle.startDate);
                
                const getDeviationText = () => {
                  if (cycle.deviation === undefined) return '';
                  if (cycle.deviation === 0) return '正常';
                  if (cycle.deviation > 0) return `推迟${cycle.deviation}天`;
                  return `提前${Math.abs(cycle.deviation)}天`;
                };
                
                const getDeviationClass = () => {
                  if (cycle.deviation === undefined) return '';
                  if (cycle.deviation === 0) return 'normal';
                  if (cycle.deviation > 0) return 'delayed';
                  return 'advanced';
                };
                
                return (
                  <div key={index} className={`cycle-item ${cycle.isCurrent ? 'current' : ''}`}>
                    {cycle.isCurrent && (
                      <div className="current-label">本周期</div>
                    )}
                    <div className="cycle-date">
                      {startDate.getMonth() + 1}月{startDate.getDate()}日
                    </div>
                    <div className="cycle-bar-container">
                      {cycle.isCurrent ? (
                        <div className="cycle-bar cycle-bar-current">
                          <div 
                            className="cycle-fill cycle-fill-current" 
                            style={{ width: `${Math.min(cycle.length, 35) / 35 * 100}%` }}
                          />
                        </div>
                      ) : (
                        <div className="cycle-bar">
                          <div 
                            className={`cycle-fill ${cycle.length < 21 ? 'cycle-fill-short' : ''}`} 
                            style={{ width: `${Math.min(cycle.length, 35) / 35 * 100}%` }}
                          >
                            <span className="cycle-bar-text">{cycle.length}天</span>
                          </div>
                          {cycle.length > 35 && (
                            <div className="cycle-fill-overflow" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`cycle-deviation ${getDeviationClass()}`}>
                      {getDeviationText()}
                    </div>
                  </div>
                );
              });
            })()
          ) : (
            <div className="no-data">暂无周期数据</div>
          )}
        </div>
        {analysis.cycleHistory && analysis.cycleHistory.length > MAX_VISIBLE_ITEMS && (
          <button 
            className="view-more-btn" 
            onClick={() => setShowAllCycles(!showAllCycles)}
          >
            {showAllCycles ? '收起' : `查看更多 (${analysis.cycleHistory.length - MAX_VISIBLE_ITEMS})`}
          </button>
        )}

        <div className="cycle-range">
          正常范围 21-35天
        </div>
      </div>

      {weightRecords.length > 0 && (
        <div className="analysis-section">
          <div className="section-title">
            <span className="icon">⚖️</span>
            <span>体重变化</span>
          </div>

          {weightReminder && (
            <div className={`weight-reminder ${weightReminder.type === 'positive' ? 'positive' : 'warning'}`}>
              <span className="reminder-icon">{weightReminder.type === 'positive' ? '🎉' : '⚠️'}</span>
              <span className="reminder-text">{weightReminder.message}</span>
            </div>
          )}

          <div className="weight-chart">
            <div className="chart-scroll-container">
              <div className="chart-wrapper">
                {weightTrend && weightTrend.records.length > 1 && (
                  <svg 
                    className="line-chart" 
                    viewBox={`0 0 ${Math.max(320, weightTrend.records.length * 70)} 180`} 
                    preserveAspectRatio="none"
                  >
                    {(() => {
                      const records = weightTrend.records;
                      const chartWidth = Math.max(300, records.length * 70);
                      const chartHeight = 160;
                      const padding = { top: 20, right: 20, bottom: 55, left: 20 };
                      const innerWidth = chartWidth - padding.left - padding.right;
                      const innerHeight = chartHeight - padding.top - padding.bottom;
                      
                      const weights = records.map(r => r.weight);
                      const minW = Math.floor(Math.min(...weights)) - 1;
                      const maxW = Math.ceil(Math.max(...weights)) + 1;
                      const range = maxW - minW || 2;
                      
                      const pointX = (index: number) => padding.left + (index / (records.length - 1)) * innerWidth;
                      const pointY = (weight: number) => padding.top + innerHeight - ((weight - minW) / range) * innerHeight;
                      
                      const points = records.map((r, i) => {
                        const x = pointX(i);
                        const y = pointY(r.weight);
                        return `${x},${y}`;
                      }).join(' ');
                      
                      const areaPoints = `M ${padding.left},${padding.top + innerHeight} L ${points} L ${padding.left + innerWidth},${padding.top + innerHeight} Z`;
                      
                      const gridLines = [];
                      const gridCount = 4;
                      for (let i = 0; i <= gridCount; i++) {
                        const y = padding.top + (i / gridCount) * innerHeight;
                        gridLines.push(y);
                      }
                      
                      return (
                        <>
                          <defs>
                            <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ff6b8a" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#ff6b8a" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          
                          {gridLines.map((y, i) => (
                            <line 
                              key={i}
                              x1={padding.left} 
                              y1={y} 
                              x2={padding.left + innerWidth} 
                              y2={y} 
                              stroke="#f0f0f0" 
                              strokeWidth="1" 
                              strokeDasharray="2,2"
                            />
                          ))}
                          
                          <line 
                            x1={padding.left} 
                            y1={padding.top} 
                            x2={padding.left} 
                            y2={padding.top + innerHeight} 
                            stroke="#e0e0e0" 
                            strokeWidth="1" 
                          />
                          <line 
                            x1={padding.left} 
                            y1={padding.top + innerHeight} 
                            x2={padding.left + innerWidth} 
                            y2={padding.top + innerHeight} 
                            stroke="#e0e0e0" 
                            strokeWidth="1" 
                          />
                          
                          <path d={areaPoints} fill="url(#weightGradient)" />
                          
                          <polyline 
                            points={points} 
                            fill="none" 
                            stroke="#ff6b8a" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                          
                          {records.map((r, i) => {
                            const x = pointX(i);
                            const y = pointY(r.weight);
                            const date = parseDate(r.date);
                            const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
                            return (
                              <g key={i}>
                                <circle cx={x} cy={y} r="4" fill="#ff6b8a" />
                                <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#ff6b8a">
                                  {r.weight}
                                </text>
                                <text x={x} y={padding.top + innerHeight + 12} textAnchor="middle" fontSize="10" fill="#999">
                                  {dateLabel}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                )}
                
                {(!weightTrend || weightTrend.records.length <= 1) && (
                  <div className="chart-no-data">
                    至少需要2个体重记录才能显示趋势图
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
