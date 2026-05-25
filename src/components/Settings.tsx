import { useState } from 'react';
import { UserData, CycleSettings } from '../types';
import { downloadData, importData, loadData } from '../utils/storage';

interface SettingsProps {
  user: UserData;
  onSettingsChange: (settings: CycleSettings) => void;
  onUpdateNickname: (nickname: string) => void;
  onSwitchUser: (userId: string) => void;
  onCreateUser: (nickname: string) => void;
}

export default function Settings({ 
  user, 
  onSettingsChange, 
  onUpdateNickname, 
  onSwitchUser, 
  onCreateUser 
}: SettingsProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState(user.nickname);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [addUserError, setAddUserError] = useState('');

  const handlePeriodLengthChange = (value: number) => {
    onSettingsChange({ ...user.settings, periodLength: value });
  };

  const handleCycleLengthChange = (value: number) => {
    onSettingsChange({ ...user.settings, cycleLength: value });
  };

  const handleExport = () => {
    downloadData();
  };

  const handleImport = () => {
    setImportError('');
    if (importText.trim()) {
      const success = importData(importText);
      if (success) {
        alert('数据导入成功！页面将刷新。');
        window.location.reload();
      } else {
        setImportError('导入失败，请检查数据格式是否正确。');
      }
    } else {
      setImportError('请输入要导入的数据。');
    }
  };

  const handleUpdateNickname = () => {
    const trimmed = newNickname.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) {
      onUpdateNickname(trimmed);
      setShowNicknameModal(false);
    }
  };

  const handleAddUser = () => {
    const trimmed = newUserName.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) {
      onCreateUser(trimmed);
      setNewUserName('');
      setAddUserError('');
      setShowAddUserModal(false);
    } else {
      setAddUserError('请输入1-20个字符的昵称');
    }
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
            <div className="setting-icon">👤</div>
            <div className="setting-info">
              <span className="setting-label">用户昵称</span>
              <span className="setting-desc">当前：{user.nickname}</span>
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
          <p className="section-description">您的月经大概持续几天？</p>
          
          <div className="setting-item" onClick={() => {}}>
            <div className="setting-icon">💧</div>
            <div className="setting-info">
              <span className="setting-label">经期长度</span>
            </div>
            <div className="setting-value">
              <span>{user.settings.periodLength > 0 ? `${user.settings.periodLength}天` : '未设置'}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="length-selector">
            {[3, 4, 5, 6, 7, 8, 9, 10].map((days) => (
              <button
                key={days}
                className={`selector-btn ${user.settings.periodLength === days ? 'active' : ''}`}
                onClick={() => handlePeriodLengthChange(days)}
              >
                {days}天
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <p className="section-description">两次月经开始日大概间隔多久？</p>
          
          <div className="setting-item" onClick={() => {}}>
            <div className="setting-icon">📅</div>
            <div className="setting-info">
              <span className="setting-label">周期长度</span>
            </div>
            <div className="setting-value">
              <span>{user.settings.cycleLength > 0 ? `${user.settings.cycleLength}天` : '未设置'}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="length-selector">
            {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map((days) => (
              <button
                key={days}
                className={`selector-btn ${user.settings.cycleLength === days ? 'active' : ''}`}
                onClick={() => handleCycleLengthChange(days)}
              >
                {days}天
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
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
              <h3>修改昵称</h3>
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
                placeholder="请输入新昵称"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                maxLength={20}
              />
            </div>

            <div className="modal-footer">
              <button className="submit-btn" onClick={handleUpdateNickname}>
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
                      <span className="user-avatar">👤</span>
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
              <textarea
                className="import-textarea"
                placeholder="粘贴导出的JSON数据..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
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
    </div>
  );
}
