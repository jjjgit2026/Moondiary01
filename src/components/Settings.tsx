import { useState, useRef } from 'react';
import { UserData, CycleSettings } from '../types';
import { downloadData, importData, loadData } from '../utils/storage';

interface SettingsProps {
  user: UserData;
  onSettingsChange: (settings: CycleSettings) => void;
  onUpdateNickname: (nickname: string) => void;
  onUpdateBirthYear: (birthYear: number) => void;
  onSwitchUser: (userId: string) => void;
  onCreateUser: (nickname: string, periodLength: number, cycleLength: number, birthYear: number) => void;
}

export default function Settings({ 
  user, 
  onSettingsChange, 
  onUpdateNickname, 
  onUpdateBirthYear, 
  onSwitchUser, 
  onCreateUser 
}: SettingsProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState(user.nickname);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [addUserError, setAddUserError] = useState('');
  
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickerType, setPickerType] = useState<'period' | 'cycle'>('period');
  const [tempPeriodLength, setTempPeriodLength] = useState(user.settings.periodLength);
  const [tempCycleLength, setTempCycleLength] = useState(user.settings.cycleLength);
  const [addUserPeriodLength, setAddUserPeriodLength] = useState(5);
  const [addUserCycleLength, setAddUserCycleLength] = useState(28);
  const [addUserBirthYear, setAddUserBirthYear] = useState(new Date().getFullYear() - 16);
  
  const periodOptions = Array.from({ length: 14 }, (_, i) => 2 + i);
  const cycleOptions = Array.from({ length: 46 }, (_, i) => 15 + i);

  const handleExport = () => {
    downloadData();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.json')) {
        setSelectedFile(file);
        setImportError('');
      } else {
        setSelectedFile(null);
        setImportError('请选择 JSON 格式的文件');
      }
    }
  };

  const handleImport = () => {
    setImportError('');
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const jsonString = e.target?.result as string;
        if (!jsonString || jsonString.trim() === '') {
          setImportError('文件内容为空');
          return;
        }
        try {
          const data = JSON.parse(jsonString);
          
          if (!data || typeof data !== 'object') {
            setImportError('数据格式不正确，应为对象类型');
            return;
          }
          
          if (!data.users || !Array.isArray(data.users)) {
            setImportError('数据格式不正确，缺少必要的 users 数组');
            return;
          }
          
          if (data.users.length === 0) {
            setImportError('users 数组不能为空');
            return;
          }
          
          for (const user of data.users) {
            if (!user.id || typeof user.id !== 'string') {
              setImportError('用户数据格式错误，缺少有效的 id');
              return;
            }
            if (!user.nickname || typeof user.nickname !== 'string') {
              setImportError('用户数据格式错误，缺少有效的 nickname');
              return;
            }
            if (!user.settings || typeof user.settings !== 'object') {
              setImportError('用户数据格式错误，缺少有效的 settings');
              return;
            }
            if (!Array.isArray(user.records)) {
              setImportError('用户数据格式错误，records 应为数组');
              return;
            }
          }
          
          const success = importData(jsonString);
          if (success) {
            alert('数据导入成功！页面将刷新。');
            window.location.reload();
          } else {
            setImportError('导入失败，请检查数据格式是否正确。');
          }
        } catch (error) {
          setImportError('JSON解析失败，请确保文件是有效的JSON格式');
        }
      };
      reader.onerror = () => {
        setImportError('文件读取失败，请重试');
      };
      reader.readAsText(selectedFile);
    } else {
      setImportError('请先选择要导入的文件');
    }
  };

  const handleAddUser = () => {
    const trimmed = newUserName.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) {
      onCreateUser(trimmed, addUserPeriodLength, addUserCycleLength, addUserBirthYear);
      setNewUserName('');
      setAddUserPeriodLength(5);
      setAddUserCycleLength(28);
      setAddUserBirthYear(new Date().getFullYear() - 16);
      setAddUserError('');
      setShowAddUserModal(false);
    } else {
      setAddUserError('请输入1-20个字符的昵称');
    }
  };
  
  const handleOpenPicker = (type: 'period' | 'cycle') => {
    setPickerType(type);
    if (type === 'period') {
      setTempPeriodLength(user.settings.periodLength || 5);
    } else {
      setTempCycleLength(user.settings.cycleLength || 28);
    }
    setShowPickerModal(true);
  };
  
  const handlePickerConfirm = () => {
    if (pickerType === 'period') {
      onSettingsChange({ ...user.settings, periodLength: tempPeriodLength });
    } else {
      onSettingsChange({ ...user.settings, cycleLength: tempCycleLength });
    }
    setShowPickerModal(false);
  };
  
  const handleOpenAddUserPicker = (type: 'period' | 'cycle') => {
    setPickerType(type);
    if (type === 'period') {
      setTempPeriodLength(addUserPeriodLength);
    } else {
      setTempCycleLength(addUserCycleLength);
    }
    setShowPickerModal(true);
  };
  
  const handleAddUserPickerConfirm = () => {
    if (pickerType === 'period') {
      setAddUserPeriodLength(tempPeriodLength);
    } else {
      setAddUserCycleLength(tempCycleLength);
    }
    setShowPickerModal(false);
  };

  const allUsers = loadData().users;
  const otherUsers = allUsers.filter(u => u.id !== user.id);

  return (
    <div className="settings">
      <div className="settings-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1>设置</h1>
        <div className="placeholder" />
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="setting-item" onClick={() => setShowNicknameModal(true)}>
            <div className="setting-icon">👧</div>
            <div className="setting-info">
              <span className="setting-label">用户设置</span>
              <span className="setting-desc">当前用户：{user.nickname}，{Math.max(0, new Date().getFullYear() - user.birthYear)}岁</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div className="settings-section">
          <div className="setting-item" onClick={() => setShowSwitchModal(true)}>
            <div className="setting-icon">🔄</div>
            <div className="setting-info">
              <span className="setting-label">切换用户</span>
              <span className="setting-desc">当前有 {allUsers.length} 个用户</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div className="settings-section">
          <div className="setting-item" onClick={() => setShowAddUserModal(true)}>
            <div className="setting-icon">➕</div>
            <div className="setting-info">
              <span className="setting-label">添加用户</span>
              <span className="setting-desc">创建新的用户账号</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div className="settings-section">
          <div className="data-safety-tip">
            <span className="tip-icon">📱</span>
            <span className="tip-text">数据安全提示：您的所有数据仅存储在本设备上。如需更换手机，请先在此导出数据，然后在新设备上导入后再使用。</span>
          </div>
          
          <div className="setting-item" onClick={handleExport}>
            <div className="setting-icon">📤</div>
            <div className="setting-info">
              <span className="setting-label">导出数据</span>
              <span className="setting-desc">将所有数据导出为JSON文件</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div className="setting-item" onClick={() => setShowImportModal(true)}>
            <div className="setting-icon">📥</div>
            <div className="setting-info">
              <span className="setting-label">导入数据</span>
              <span className="setting-desc">从JSON文件恢复数据</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {showNicknameModal && (
        <div className="modal-overlay" onClick={() => setShowNicknameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>用户设置</h3>
              <button className="close-btn" onClick={() => setShowNicknameModal(false)}>
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
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                maxLength={20}
              />

              <div className="cycle-settings-form">
                <p className="form-description">您的月经大概持续几天？</p>
                <div className="cycle-setting-row" onClick={() => handleOpenPicker('period')}>
                  <div className="cycle-setting-icon">💧</div>
                  <div className="cycle-setting-info">
                    <span className="cycle-setting-label">经期长度</span>
                  </div>
                  <div className="cycle-setting-value">
                    <span>{user.settings.periodLength > 0 ? `${user.settings.periodLength}天` : '未设置'}</span>
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
                    <span>{user.settings.cycleLength > 0 ? `${user.settings.cycleLength}天` : '未设置'}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <p className="form-description">出生年份</p>
                <div className="cycle-setting-row">
                  <div className="cycle-setting-icon">🎂</div>
                  <div className="cycle-setting-info">
                    <span className="cycle-setting-label">出生年份</span>
                  </div>
                  <input
                    type="number"
                    className="birth-year-input"
                    value={user.birthYear || new Date().getFullYear() - 16}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1900 && value <= new Date().getFullYear()) {
                        onUpdateBirthYear(value);
                      }
                    }}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="submit-btn" onClick={() => {
                if (newNickname.trim()) {
                  onUpdateNickname(newNickname.trim());
                }
                setShowNicknameModal(false);
              }}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showSwitchModal && (
        <div className="modal-overlay" onClick={() => setShowSwitchModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>切换用户</h3>
              <button className="close-btn" onClick={() => setShowSwitchModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="form-section">
              {otherUsers.length > 0 ? (
                <div className="users-list-modal">
                  {otherUsers.map((u) => (
                    <button
                      key={u.id}
                      className="user-item-modal"
                      onClick={() => {
                        onSwitchUser(u.id);
                        setShowSwitchModal(false);
                      }}
                    >
                      <span className="user-avatar">👧</span>
                      <span className="user-name">{u.nickname}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-users">暂无其他用户，请先添加用户</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>添加用户</h3>
              <button className="close-btn" onClick={() => setShowAddUserModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="form-section">
              <input
                type="text"
                className="nickname-input-modal"
                placeholder="请输入新用户昵称"
                value={newUserName}
                onChange={(e) => {
                  setNewUserName(e.target.value);
                  setAddUserError('');
                }}
                maxLength={20}
              />
              {addUserError && (
                <span className="error-message">{addUserError}</span>
              )}
              
              <div className="cycle-settings-form">
                <p className="form-description">您的月经大概持续几天？</p>
                <div className="cycle-setting-row" onClick={() => handleOpenAddUserPicker('period')}>
                  <div className="cycle-setting-icon">💧</div>
                  <div className="cycle-setting-info">
                    <span className="cycle-setting-label">经期长度</span>
                  </div>
                  <div className="cycle-setting-value">
                    <span>{addUserPeriodLength}天</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                <p className="form-description">两次月经开始日大概间隔多久？</p>
                <div className="cycle-setting-row" onClick={() => handleOpenAddUserPicker('cycle')}>
                  <div className="cycle-setting-icon">📅</div>
                  <div className="cycle-setting-info">
                    <span className="cycle-setting-label">周期长度</span>
                  </div>
                  <div className="cycle-setting-value">
                    <span>{addUserCycleLength}天</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <p className="form-description">请输入出生年份</p>
                <div className="cycle-setting-row">
                  <div className="cycle-setting-icon">🎂</div>
                  <div className="cycle-setting-info">
                    <span className="cycle-setting-label">出生年份</span>
                  </div>
                  <input
                    type="number"
                    className="birth-year-input"
                    value={addUserBirthYear}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1900 && value <= new Date().getFullYear()) {
                        setAddUserBirthYear(value);
                      }
                    }}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="submit-btn" onClick={handleAddUser}>
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>导入数据</h3>
              <button className="close-btn" onClick={() => setShowImportModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="form-section">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="file-input"
              />
              <button 
                className="file-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <span>📄 {selectedFile.name}</span>
                ) : (
                  <span>📥 点击选择 JSON 文件</span>
                )}
              </button>
              {importError && (
                <span className="error-message">{importError}</span>
              )}
            </div>

            <div className="modal-footer">
              <button className="submit-btn" onClick={handleImport}>
                导入
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
                {pickerType === 'period' ? '选择经期天数' : '选择周期天数'}
              </h3>
              <button className="picker-confirm" onClick={showAddUserModal ? handleAddUserPickerConfirm : handlePickerConfirm}>确定</button>
            </div>
            <div className="picker-container">
              <div className="picker-items">
                {(pickerType === 'period' ? periodOptions : cycleOptions).map((days) => (
                  <button
                    key={days}
                    className={`picker-item ${(pickerType === 'period' ? tempPeriodLength : tempCycleLength) === days ? 'selected' : ''}`}
                    onClick={() => {
                      if (pickerType === 'period') {
                        setTempPeriodLength(days);
                      } else {
                        setTempCycleLength(days);
                      }
                    }}
                  >
                    {days}天
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
