export interface PeriodRecord {
  date: string;
  isPeriod: boolean;
  flow?: 'light' | 'medium' | 'heavy';
  symptoms?: string[];
  mood?: 'happy' | 'neutral' | 'sad' | 'angry' | 'anxious' | 'tired';
  note?: string;
}

export interface CycleSettings {
  periodLength: number;
  cycleLength: number;
}

export interface UserData {
  id: string;
  nickname: string;
  records: PeriodRecord[];
  settings: CycleSettings;
}

export interface AppData {
  currentUserId: string;
  users: UserData[];
}
