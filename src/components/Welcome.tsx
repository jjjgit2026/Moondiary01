import { useState } from 'react';
import { UserData } from '../types';

interface WelcomeProps {
  users: UserData[];
  onCreateUser: (nickname: string, periodLength: number, cycleLength: number, birthYear: number) => void;
  onSwitchUser: (userId: string) => void;
}

export default function Welcome({ users = [], onCreateUser, onSwitchUser }: WelcomeProps) {
  const [showModal, setShowModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [showError, setShowError] = useState(false);
  const [periodLength, setPeriodLength] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);
  const [birthYear, setBirthYear] = useState(new Date().getFullYear() - 16);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickerType, setPickerType] = useState<'period' | 'cycle' | 'birthYear'>('period');
  const [tempPeriodLength, setTempPeriodLength] = useState(5);
  const [tempCycleLength, setTempCycleLength] = useState(28);
  const [tempBirthYear, setTempBirthYear] = useState(new Date().getFullYear() - 16);

  const periodOptions = Array.from({ length: 14 }, (_, i) => 2 + i);
  const cycleOptions = Array.from({ length: 46 }, (_, i) => 15 + i);
  const currentYear = new Date().getFullYear();
  const birthYearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) {
      onCreateUser(trimmed, periodLength, cycleLength, birthYear);
      setNickname('');
      setPeriodLength(5);
      setCycleLength(28);
      setBirthYear(new Date().getFullYear() - 16);
      setShowModal(false);
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const handleOpenPicker = (type: 'period' | 'cycle' | 'birthYear') => {
    setPickerType(type);
    if (type === 'period') {
      setTempPeriodLength(periodLength);
    } else if (type === 'cycle') {
      setTempCycleLength(cycleLength);
    } else {
      setTempBirthYear(birthYear);
    }
    setShowPickerModal(true);
  };

  const handlePickerConfirm = () => {
    if (pickerType === 'period') {
      setPeriodLength(tempPeriodLength);
    } else if (pickerType === 'cycle') {
      setCycleLength(tempCycleLength);
    } else {
      setBirthYear(tempBirthYear);
    }
    setShowPickerModal(false);
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-icon">💫</div>
        <h1 className="welcome-title">经期记录</h1>
        <p className="welcome-subtitle">关爱自己，从记录开始</p>

        {users && users.length > 0 && (
          <div className="existing-users">
            <h3 className="users-title">已有用户</h3>
            <div className="users-list">
              {users.map((user) => (
                <button
                  key={user.id}
                  className="user-item"
                  onClick={() => onSwitchUser(user.id)}
                >
                  <span className="user-avatar">👧</span>
                  <div className="user-detail-welcome">
                    <span className="user-name">{user.nickname}</span>
                    <span className="user-age-welcome">{Math.max(0, new Date().getFullYear() - user.birthYear)}岁</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="create-btn" onClick={() => setShowModal(true)}>
          {users && users.length > 0 ? '添加新用户' : '创建新用户'}
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content full-width" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>创建新用户</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="form-section">
              <input
                type="text"
                className="nickname-input-modal"
                placeholder="请输入昵称"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setShowError(false);
                }}
                maxLength={20}
              />
              {showError && (
                <span className="error-message">请输入1-20个字符的昵称</span>
              )}

              <div className="cycle-settings-form">
                <p className="form-description">您的月经大概持续几天？</p>
                <div className="cycle-setting-row" onClick={() => handleOpenPicker('period')}>
                  <div className="cycle-setting-icon">💧</div>
                  <div className="cycle-setting-info">
                    <span className="cycle-setting-label">经期长度</span>
                  </div>
                  <div className="cycle-setting-value">
                    <span>{periodLength}天</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <p className="form-description">两次月经开始日大概间隔多久？</p>
                <div className="cycle-setting-row" onClick={() => handleOpenPicker('cycle')}>
                  <div className="cycle-setting-icon">📅</div>
                  <div className="cycle-setting-info">
                    <span className="cycle-setting-label">周期长度</span>
                  </div>
                  <div className="cycle-setting-value">
                    <span>{cycleLength}天</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <p className="form-description">请选择出生年份</p>
                <div className="cycle-setting-row" onClick={() => handleOpenPicker('birthYear')}>
                  <div className="cycle-setting-icon">🎂</div>
                  <div className="cycle-setting-info">
                    <span className="cycle-setting-label">出生年份</span>
                  </div>
                  <div className="cycle-setting-value">
                    <span>{birthYear}年</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="submit-btn" onClick={handleSubmit}>
                开始记录
              </button>
            </div>
          </div>
        </div>
      )}

      {showPickerModal && (
        <div className="picker-modal-overlay" onClick={() => setShowPickerModal(false)}>
          <div className="picker-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <button className="picker-cancel" onClick={() => setShowPickerModal(false)}>取消</button>
              <h3 className="picker-title">
                {pickerType === 'period' ? '选择经期天数' : pickerType === 'cycle' ? '选择周期天数' : '选择出生年份'}
              </h3>
              <button className="picker-confirm" onClick={handlePickerConfirm}>确定</button>
            </div>
            <div className="picker-container">
              <div className="picker-items">
                {(pickerType === 'period' ? periodOptions : pickerType === 'cycle' ? cycleOptions : birthYearOptions).map((value) => (
                  <button
                    key={value}
                    className={`picker-item ${
                      (pickerType === 'period' ? tempPeriodLength : 
                       pickerType === 'cycle' ? tempCycleLength : tempBirthYear) === value ? 'selected' : ''
                    }`}
                    onClick={() => {
                      if (pickerType === 'period') {
                        setTempPeriodLength(value);
                      } else if (pickerType === 'cycle') {
                        setTempCycleLength(value);
                      } else {
                        setTempBirthYear(value);
                      }
                    }}
                  >
                    {pickerType === 'birthYear' ? `${value}年` : `${value}天`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
