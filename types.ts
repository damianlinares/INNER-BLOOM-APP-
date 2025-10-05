
export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  reflection?: string;
  isLoadingReflection?: boolean;
  synced?: boolean; 
  needsReflection?: boolean;
}

export interface Session {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  summary: string;
  conversation: { role: 'user' | 'model'; text: string }[];
}

export interface CheckInData {
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  gratitude: [string, string, string];
}

export interface JourneyStep {
  id: string;
  title: string;
  type: 'journal' | 'meditation' | 'breathing';
  targetId?: string; 
  prompt?: string; 
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  steps: JourneyStep[];
  achievementId: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; 
}

export interface SharedIntention {
    id: string;
    text: string;
    author: 'anonymous' | 'You';
    energy: number;
}

export type DashboardComponent = 'stats' | 'tree' | 'journey' | 'insight';

export interface UserData {
  lastCheckIn: string | null;
  streak: number;
  points: number;
  journal: JournalEntry[];
  sessions: Session[];
  checkIns: CheckInData[];
  activeJourney: {
      journeyId: string;
      currentStep: number;
  } | null;
  completedJourneys: string[];
  unlockedAchievements: string[];
  insights: string[];
  lastInsightDate: string | null;
  dashboardLayout: DashboardComponent[];
}

export interface CommunityPost {
  id: string;
  author: string;
  content: string;
  reactions: { [key: string]: number };
}

export interface Soundscape {
  id: string;
  title: string;
  file: string;
}

export interface Meditation {
  id: string;
  title: string;
  category: string;
  duration: number; // in seconds
  file: string;
}

export interface BreathingExercise {
  id: string;
  title: string;
  description: string;
  pattern: { name: 'Inhale' | 'Hold' | 'Exhale'; duration: number }[];
}