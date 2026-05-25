import { useState } from 'react';
import { UserData } from '../types';

interface WelcomeProps {
  users: UserData[];
  onCreateUser: (nickname: string) => void;
  onSwitchUser: (userId: string) => void;
}

export default function Welcome({ users = [], onCreateUser, onSwitchUser }: WelcomeProps) {
  const [nickname, setNickname] = useState('');
  const [showError, setShowError] = useState(false);

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) {
      onCreateUser(trimmed);
      setNickname('');
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
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
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{user.nickname}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="create-user">
          <h3 className="create-title">{users && users.length > 0 ? '或添加新用户' : '创建新用户'}</h3>
          <input
            type="text"
            className="nickname-input"
            placeholder="请输入昵称"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setShowError(false);
            }}
            onKeyPress={handleKeyPress}
          />
          {showError && (
            <span className="error-text">请输入1-20个字符的昵称</span>
          )}
          <button className="create-btn" onClick={handleSubmit}>
            开始记录
          </button>
        </div>
      </div>
    </div>
  );
}
