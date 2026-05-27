import { useState, useEffect, useCallback, useMemo } from 'react';
import { PeriodRecord, CycleSettings, UserData } from './types';
import { 
  loadData, 
  createUser, 
  switchUser, 
  updateNickname, 
  updateBirthYear,
  updateUserSettings, 
  updateUserRecords,
  addRecord 
} from './utils/storage';
import Calendar from './components/Calendar';
import YearCalendar from './components/YearCalendar';
import RecordForm from './components/RecordForm';
import Analysis from './components/Analysis';
import Settings from './components/Settings';
import Welcome from './components/Welcome';
import PeriodKnowledge from './components/PeriodKnowledge';
import './App.css';

type TabType = 'calendar' | 'analysis' | 'settings';
type PageType = 'main' | 'knowledge';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showYearCalendar, setShowYearCalendar] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('main');

  useEffect(() => {
    const data = loadData();
    if (data.users.length === 0) {
      setShowWelcome(true);
    } else {
      const user = data.users.find(u => u.id === data.currentUserId);
      setCurrentUser(user || data.users[0]);
      setShowWelcome(false);
    }
  }, []);

  const handleCreateUser = useCallback((nickname: string, periodLength: number, cycleLength: number, birthYear: number) => {
    const data = createUser(nickname, periodLength, cycleLength, birthYear);
    const user = data.users.find(u => u.id === data.currentUserId);
    setCurrentUser(user || null);
    setShowWelcome(false);
  }, []);

  const handleSwitchUser = useCallback((userId: string) => {
    const data = switchUser(userId);
    const user = data.users.find(u => u.id === data.currentUserId);
    setCurrentUser(user || null);
  }, []);

  const handleUpdateNickname = useCallback((nickname: string) => {
    if (currentUser) {
      const data = updateNickname(currentUser.id, nickname);
      const user = data.users.find(u => u.id === data.currentUserId);
      setCurrentUser(user || null);
    }
  }, [currentUser]);

  const handleUpdateBirthYear = useCallback((birthYear: number) => {
    if (currentUser) {
      const data = updateBirthYear(currentUser.id, birthYear);
      const user = data.users.find(u => u.id === data.currentUserId);
      setCurrentUser(user || null);
    }
  }, [currentUser]);

  const handleSettingsChange = useCallback((newSettings: CycleSettings) => {
    if (currentUser) {
      const data = updateUserSettings(currentUser.id, newSettings);
      const user = data.users.find(u => u.id === data.currentUserId);
      setCurrentUser(user || null);
    }
  }, [currentUser]);

  const handleSaveRecord = useCallback((dateOrRecord: string | PeriodRecord) => {
    if (currentUser) {
      let record: PeriodRecord;
      if (typeof dateOrRecord === 'string') {
        record = {
          date: dateOrRecord,
          isPeriod: true,
        };
      } else {
        record = dateOrRecord;
      }
      const newRecords = addRecord(currentUser.records, record);
      const data = updateUserRecords(currentUser.id, newRecords);
      const user = data.users.find(u => u.id === data.currentUserId);
      setCurrentUser(user || null);
    }
    setSelectedDate(null);
  }, [currentUser]);

  const handlePeriodEnd = useCallback((startDateStr: string, endDate: string) => {
    if (currentUser) {
      const startDate = new Date(startDateStr);
      const endDateObj = new Date(endDate);
      
      if (endDateObj < startDate) {
        alert('结束日期不能早于开始日期');
        return;
      }

      const newRecords = [...currentUser.records];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDateObj) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const existingIndex = newRecords.findIndex(r => r.date === dateStr);
        
        if (existingIndex >= 0) {
          newRecords[existingIndex].isPeriod = true;
        } else {
          newRecords.push({
            date: dateStr,
            isPeriod: true,
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const data = updateUserRecords(currentUser.id, newRecords);
      const user = data.users.find(u => u.id === data.currentUserId);
      setCurrentUser(user || null);
    }
  }, [currentUser]);

  const handleDateClick = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const lastPeriodStart = useMemo(() => {
    if (!currentUser || !selectedDate) return null;
    
    const periodRecords = currentUser.records
      .filter(r => r.isPeriod)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (periodRecords.length === 0) return null;
    
    const selected = new Date(selectedDate);
    
    for (let i = periodRecords.length - 1; i >= 0; i--) {
      const recordDate = new Date(periodRecords[i].date);
      if (recordDate <= selected) {
        let startDate = periodRecords[i].date;
        for (let j = i; j > 0; j--) {
          const prevDate = new Date(periodRecords[j - 1].date);
          const currDate = new Date(periodRecords[j].date);
          const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
            break;
          }
          startDate = periodRecords[j - 1].date;
        }
        return startDate;
      }
    }
    
    return null;
  }, [currentUser, selectedDate]);

  if (showWelcome || !currentUser) {
    const allUsers = loadData().users;
    return (
      <Welcome
        users={allUsers}
        onCreateUser={handleCreateUser}
        onSwitchUser={handleSwitchUser}
      />
    );
  }

  const selectedRecord = selectedDate 
    ? currentUser.records.find(r => r.date === selectedDate) 
    : undefined;

  const canShowPrediction = currentUser.settings.periodLength > 0 && 
                           currentUser.settings.cycleLength > 0 &&
                           currentUser.records.filter(r => r.isPeriod).length >= 2;

  return (
    <div className="app">
      {currentPage === 'knowledge' ? (
        <PeriodKnowledge onBack={() => {
          setCurrentPage('main');
          setActiveTab('calendar');
        }} />
      ) : (
        <>
          {activeTab !== 'settings' && (
            <header className="header">
              <div className="header-content">
                <div className="user-info">
                  <span className="user-icon">👧</span>
                  <div className="user-detail">
                    <span className="user-nickname">{currentUser.nickname}</span>
                    <span className="user-age">{Math.max(0, new Date().getFullYear() - currentUser.birthYear)}岁</span>
                  </div>
                </div>
                <button 
                  className="knowledge-btn"
                  onClick={() => setCurrentPage('knowledge')}
                >
                  <span className="knowledge-icon">📚</span>
                  <span className="knowledge-text">小知识</span>
                </button>
              </div>
            </header>
          )}

          {activeTab === 'calendar' && !showYearCalendar && (
            <Calendar 
              records={currentUser.records} 
              settings={currentUser.settings} 
              onDateClick={handleDateClick}
              onMonthClick={() => setShowYearCalendar(true)}
              canShowPrediction={canShowPrediction}
            />
          )}
          {activeTab === 'calendar' && showYearCalendar && (
            <YearCalendar
              records={currentUser.records}
              currentYear={new Date().getFullYear()}
              onBack={() => setShowYearCalendar(false)}
            />
          )}
          {activeTab === 'analysis' && currentUser && (
            <Analysis 
              records={currentUser.records || []} 
              settings={currentUser.settings || { periodLength: 5, cycleLength: 28 }} 
              birthYear={currentUser.birthYear || new Date().getFullYear() - 16}
            />
          )}
          {activeTab === 'settings' && (
            <Settings
              user={currentUser}
              onSettingsChange={handleSettingsChange}
              onUpdateNickname={handleUpdateNickname}
              onUpdateBirthYear={handleUpdateBirthYear}
              onSwitchUser={handleSwitchUser}
              onCreateUser={handleCreateUser}
            />
          )}

        </>
      )}

      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('calendar');
            setCurrentPage('main');
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>日历</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('analysis');
            setCurrentPage('main');
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
          <span>分析</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('settings');
            setCurrentPage('main');
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>设置</span>
        </button>
      </nav>

      {selectedDate && (
        <RecordForm
          date={selectedDate}
          record={selectedRecord}
          lastPeriodStart={lastPeriodStart}
          onSave={handleSaveRecord}
          onPeriodEnd={handlePeriodEnd}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
