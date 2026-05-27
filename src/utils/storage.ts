import { PeriodRecord, CycleSettings, UserData, AppData } from '../types';

const STORAGE_KEY = 'cycle-mate-data';

const defaultSettings: CycleSettings = {
  periodLength: 0,
  cycleLength: 0,
};

const createNewUser = (nickname: string, birthYear: number = new Date().getFullYear() - 16): UserData => ({
  id: Date.now().toString(),
  nickname,
  birthYear,
  records: [],
  settings: { ...defaultSettings },
});

const getDefaultData = (): AppData => ({
  currentUserId: '',
  users: [],
});

export const loadData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && parsed.users && Array.isArray(parsed.users)) {
        const validatedUsers = parsed.users.filter((user: unknown) => {
          if (typeof user !== 'object' || user === null) return false;
          const u = user as UserData;
          return (
            typeof u.id === 'string' &&
            typeof u.nickname === 'string' &&
            Array.isArray(u.records) &&
            typeof u.settings === 'object' &&
            u.settings !== null
          );
        });
        
        return {
          currentUserId: typeof parsed.currentUserId === 'string' ? parsed.currentUserId : '',
          users: validatedUsers,
        };
      } else {
        return getDefaultData();
      }
    }
  } catch {
    console.error('Failed to load data from localStorage');
  }
  return getDefaultData();
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error('Failed to save data to localStorage');
  }
};

export const addRecord = (records: PeriodRecord[], record: PeriodRecord): PeriodRecord[] => {
  const existingIndex = records.findIndex(r => r.date === record.date);
  if (existingIndex >= 0) {
    const newRecords = [...records];
    newRecords[existingIndex] = record;
    return newRecords;
  }
  return [...records, record];
};

export const createUser = (nickname: string, periodLength: number = 5, cycleLength: number = 28, birthYear: number = new Date().getFullYear() - 16): AppData => {
  const data = loadData();
  const newUser = {
    ...createNewUser(nickname, birthYear),
    settings: {
      periodLength,
      cycleLength,
    },
  };
  data.users.push(newUser);
  data.currentUserId = newUser.id;
  saveData(data);
  return data;
};

export const switchUser = (userId: string): AppData => {
  const data = loadData();
  data.currentUserId = userId;
  saveData(data);
  return data;
};

export const updateNickname = (userId: string, nickname: string): AppData => {
  const data = loadData();
  const userIndex = data.users.findIndex(u => u.id === userId);
  if (userIndex >= 0) {
    data.users[userIndex].nickname = nickname;
    saveData(data);
  }
  return data;
};

export const updateBirthYear = (userId: string, birthYear: number): AppData => {
  const data = loadData();
  const userIndex = data.users.findIndex(u => u.id === userId);
  if (userIndex >= 0) {
    data.users[userIndex].birthYear = birthYear;
    saveData(data);
  }
  return data;
};

export const deleteUser = (userId: string): AppData => {
  const data = loadData();
  data.users = data.users.filter(u => u.id !== userId);
  if (data.currentUserId === userId) {
    data.currentUserId = data.users.length > 0 ? data.users[0].id : '';
  }
  saveData(data);
  return data;
};

export const getCurrentUser = (): UserData | null => {
  const data = loadData();
  return data.users.find(u => u.id === data.currentUserId) || null;
};

export const updateUserSettings = (userId: string, settings: CycleSettings): AppData => {
  const data = loadData();
  const userIndex = data.users.findIndex(u => u.id === userId);
  if (userIndex >= 0) {
    data.users[userIndex].settings = settings;
    saveData(data);
  }
  return data;
};

export const updateUserRecords = (userId: string, records: PeriodRecord[]): AppData => {
  const data = loadData();
  const userIndex = data.users.findIndex(u => u.id === userId);
  if (userIndex >= 0) {
    data.users[userIndex].records = records;
    saveData(data);
  }
  return data;
};

export const exportData = (): string => {
  const data = loadData();
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return false;
    }
    
    const parsed = JSON.parse(jsonString);
    
    if (!parsed || typeof parsed !== 'object') {
      return false;
    }
    
    const data: AppData = {
      currentUserId: typeof parsed.currentUserId === 'string' ? parsed.currentUserId : '',
      users: [],
    };
    
    if (!parsed.users || !Array.isArray(parsed.users)) {
      saveData(data);
      return true;
    }
    
    for (const user of parsed.users) {
      if (typeof user !== 'object' || user === null) continue;
      
      const userId = typeof user.id === 'string' ? user.id : Date.now().toString();
      const nickname = typeof user.nickname === 'string' ? user.nickname : '用户';
      
      const records: PeriodRecord[] = [];
      if (Array.isArray(user.records)) {
        for (const record of user.records) {
          if (typeof record !== 'object' || record === null) continue;
          if (typeof record.date !== 'string') continue;
          
          records.push({
            date: record.date,
            isPeriod: typeof record.isPeriod === 'boolean' ? record.isPeriod : false,
            flow: record.flow === 'light' || record.flow === 'medium' || record.flow === 'heavy' ? record.flow : undefined,
            symptoms: Array.isArray(record.symptoms) ? record.symptoms : undefined,
            mood: record.mood === 'happy' || record.mood === 'neutral' || record.mood === 'sad' || record.mood === 'angry' || record.mood === 'anxious' || record.mood === 'tired' ? record.mood : undefined,
            weight: typeof record.weight === 'number' && record.weight > 0 && record.weight <= 200 ? record.weight : undefined,
            note: typeof record.note === 'string' ? record.note : undefined,
          });
        }
      }
      
      const settings: CycleSettings = {
        periodLength: typeof user.settings?.periodLength === 'number' ? user.settings.periodLength : 5,
        cycleLength: typeof user.settings?.cycleLength === 'number' ? user.settings.cycleLength : 28,
      };
      
      const birthYear = typeof user.birthYear === 'number' ? user.birthYear : new Date().getFullYear() - 16;
      
      data.users.push({
        id: userId,
        nickname,
        birthYear,
        records,
        settings,
      });
    }
    
    if (data.users.length > 0 && !data.currentUserId) {
      data.currentUserId = data.users[0].id;
    }
    
    saveData(data);
    return true;
  } catch (error) {
    console.error('Import data error:', error);
    return false;
  }
};

export const downloadData = (): void => {
  const data = exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cycle-mate-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateMockData = (): PeriodRecord[] => {
  const records: PeriodRecord[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  for (let monthOffset = -2; monthOffset <= 0; monthOffset++) {
    const date = new Date(currentYear, currentMonth + monthOffset, 1);
    const daysInMonth = new Date(currentYear, currentMonth + monthOffset + 1, 0).getDate();
    const periodStartDay = Math.floor(Math.random() * 10) + 1;
    
    for (let i = 0; i < 5; i++) {
      const day = periodStartDay + i;
      if (day <= daysInMonth) {
        const recordDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        records.push({
          date: recordDate,
          isPeriod: true,
          flow: ['light', 'medium', 'heavy'][Math.floor(Math.random() * 3)] as PeriodRecord['flow'],
          symptoms: Math.random() > 0.5 ? ['腹痛', '腰酸'] : undefined,
          mood: ['happy', 'neutral', 'sad', 'angry', 'anxious', 'tired'][Math.floor(Math.random() * 6)] as PeriodRecord['mood'],
        });
      }
    }
  }
  
  return records;
};
