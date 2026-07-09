export interface PeriodRecord {
  date: string;
  isPeriod: boolean;
  flow?: 'light' | 'medium' | 'heavy';
  symptoms?: string[];
  mood?: 'happy' | 'neutral' | 'sad' | 'angry' | 'anxious' | 'tired';
  weight?: number;
  waistline?: number;
  note?: string;
}

export interface CycleSettings {
  periodLength: number;
  cycleLength: number;
}

export interface UserData {
  id: string;
  nickname: string;
  birthYear: number;
  records: PeriodRecord[];
  settings: CycleSettings;
}

export interface AppData {
  currentUserId: string;
  users: UserData[];
}
