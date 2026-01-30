
export enum Depth {
  OVERVIEW = 'overview',
  DETAILED = 'detailed'
}

export enum LearningMode {
  KNOWLEDGE = 'knowledge-only',
  HANDS_ON = 'hands-on'
}

export interface Resource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'docs';
}

export interface Tool {
  name: string;
  description: string;
}

export interface MiniProject {
  goal: string;
  steps: string[];
  estimatedTime: string;
}

export interface BiteContent {
  setup: string;
  explanation: string;
  analogy: string;
  takeaway: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface LearningBite {
  id: string;
  title: string;
  learningObjective: string;
  estimatedMinutes: number;
  content: BiteContent;
  example: {
    title: string;
    description: string;
  };
  tools: Tool[];
  resources: Resource[];
  miniQuiz: QuizQuestion[]; // 3 questions mandatory for completion
  miniProject?: MiniProject;
  completed?: boolean;
  completedAt?: string;
  timeSpentSeconds?: number;
}

export interface LearningPlan {
  id: string;
  topic: string;
  depth: Depth;
  mode: LearningMode;
  dailyTime: number;
  bitesPerDay: number;
  totalBites: number;
  bites: LearningBite[];
  quiz: QuizQuestion[]; // Final mastery quiz
  quizPassed?: boolean;
  quizScore?: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  currentPlanId?: string;
}

export interface AppState {
  user: User | null;
  plans: LearningPlan[];
  activePlanId: string | null;
  loading: boolean;
  loadingMessage: string;
}
