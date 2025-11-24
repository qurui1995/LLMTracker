export enum StudyStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export interface DayPlan {
  day: number;
  title: string;
  description: string;
  topics: string[];
  codingTask: string;
  interviewFocus: string;
  status: StudyStatus;
  hoursSpent: number;
  targetHours: number;
  notes?: string;
}

export interface StudyStats {
  totalHours: number;
  completedDays: number;
  currentStreak: number;
  penaltyHoursAccumulated: number;
}

export interface UserProfile {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
}
