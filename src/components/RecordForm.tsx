import { useState, useEffect, useMemo } from 'react';
import { PeriodRecord } from '../types';
import { parseDate } from '../utils/date';

interface RecordFormProps {
  date: string;
  record: PeriodRecord | undefined;
  lastPeriodStart: string | null;
  onSave: (record: PeriodRecord) => void;
  onPeriodEnd: (startDate: string, endDate: string) => void;
  onClose: () => void;
}

const symptomsList = ['腹痛', '腰酸', '头痛', '乳房胀痛', '疲劳', '情绪波动', '恶心', '失眠'];

const moodOptions = [
  { value: 'happy', label: '😊', description: '开心' },
  { value: 'neutral', label: '😐', description: '平静' },
  { value: 'sad', label: '😢', description: '难过' },
  { value: 'angry', label: '😠', description: '生气' },
  { value: 'anxious', label: '😰', description: '焦虑' },
  { value: 'tired', label: '😴', description: '疲惫' },
];

const flowOptions = [
  { value: 'light', label: '少量' },
  { value: 'medium', label: '中等' },
  { value: 'heavy', label: '大量' },
];

export default function RecordForm({ date, record, lastPeriodStart, onSave, onPeriodEnd, onClose }: RecordFormProps) {
  const [isPeriod, setIsPeriod] = useState(record?.isPeriod || false);
  const [flow, setFlow] = useState<PeriodRecord['flow']>(record?.flow);
  const [symptoms, setSymptoms] = useState<string[]>(record?.symptoms || []);
  const [mood, setMood] = useState<PeriodRecord['mood']>(record?.mood);
  const [weight, setWeight] = useState<string>(record?.weight?.toString() || '');
  const [note, setNote] = useState(record?.note || '');

  const isCurrentDatePeriod = record?.isPeriod || false;
  
  const canEndPeriod = useMemo(() => {
    if (!lastPeriodStart || isCurrentDatePeriod) return false;
    
    const periodStart = parseDate(lastPeriodStart);
    const currentDate = parseDate(date);
    
    if (currentDate < periodStart) return false;
    
    const daysSinceStart = Math.floor((currentDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceStart <= 14;
  }, [lastPeriodStart, date, isCurrentDatePeriod]);

  useEffect(() => {
    setIsPeriod(record?.isPeriod || false);
    setFlow(record?.flow);
    setSymptoms(record?.symptoms || []);
    setMood(record?.mood);
    setWeight(record?.weight?.toString() || '');
    setNote(record?.note || '');
  }, [record]);

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    const newRecord: PeriodRecord = {
      date,
      isPeriod,
    };

    if (isPeriod && flow) {
      newRecord.flow = flow;
    }

    if (symptoms.length > 0) {
      newRecord.symptoms = symptoms;
    }

    if (mood) {
      newRecord.mood = mood;
    }

    if (weight.trim()) {
      const weightValue = parseFloat(weight);
      if (!isNaN(weightValue)) {
        newRecord.weight = weightValue;
      }
    }

    if (note.trim()) {
      newRecord.note = note.trim();
    }

    onSave(newRecord);
  };

  const handlePeriodEnd = () => {
    if (lastPeriodStart) {
      onPeriodEnd(lastPeriodStart, date);
      onClose();
    }
  };

  const displayDate = parseDate(date);
  const dateStr = `${displayDate.getMonth() + 1}月${displayDate.getDate()}日`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{dateStr} 记录</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {canEndPeriod ? (
          <div className="form-section">
            <div className="section-title">
              <span className="icon">👋</span>
              <span>大姨妈走了</span>
            </div>
            <div className="period-end-hint">
              点击"是"将自动设置 {lastPeriodStart} 至 {date} 为经期
            </div>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${!isPeriod ? 'active' : ''}`}
                onClick={() => setIsPeriod(false)}
              >
                否
              </button>
              <button
                className={`toggle-btn period-end-btn ${isPeriod ? 'active' : ''}`}
                onClick={handlePeriodEnd}
              >
                是
              </button>
            </div>
          </div>
        ) : (
          <div className="form-section">
            <div className="section-title">
              <span className="icon">💧</span>
              <span>大姨妈来了</span>
            </div>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${!isPeriod ? 'active' : ''}`}
                onClick={() => setIsPeriod(false)}
              >
                否
              </button>
              <button
                className={`toggle-btn ${isPeriod ? 'active' : ''}`}
                onClick={() => setIsPeriod(true)}
              >
                是
              </button>
            </div>
          </div>
        )}

        <div className="form-section">
          <div className="section-title">
            <span className="icon">📊</span>
            <span>流量</span>
          </div>
          <div className="options-group">
            {flowOptions.map((option) => (
              <button
                key={option.value}
                className={`option-btn ${flow === option.value ? 'active' : ''}`}
                onClick={() => setFlow(option.value as PeriodRecord['flow'])}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="icon">🤕</span>
            <span>症状</span>
          </div>
          <div className="options-group">
            {symptomsList.map((symptom) => (
              <button
                key={symptom}
                className={`option-btn ${symptoms.includes(symptom) ? 'active' : ''}`}
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="icon">😊</span>
            <span>心情</span>
          </div>
          <div className="options-group mood-options">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                className={`option-btn mood-btn ${mood === option.value ? 'active' : ''}`}
                onClick={() => setMood(option.value as PeriodRecord['mood'])}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="icon">⚖️</span>
            <span>体重 (kg)</span>
          </div>
          <input
            type="number"
            className="weight-input"
            placeholder="请输入体重"
            value={weight}
            onChange={(e) => {
              const value = e.target.value;
              const regex = /^\d*\.?\d{0,2}$/;
              if (value === '' || regex.test(value)) {
                setWeight(value);
              }
            }}
            step="0.01"
            min="0"
            max="200"
          />
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="icon">📝</span>
            <span>备注</span>
          </div>
          <textarea
            className="note-input"
            placeholder="添加备注..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button className="submit-btn" onClick={handleSubmit}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
