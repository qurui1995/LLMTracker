export enum StudyStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export type Language = 'en' | 'zh';

export interface KnowledgePoint {
  text: string;
  isLearned: boolean;
  explanation?: string; // Cache for the AI explanation
}

export interface DayPlan {
  day: number;
  title: string;
  description: string;
  topics: string[];
  knowledgePoints: KnowledgePoint[];
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