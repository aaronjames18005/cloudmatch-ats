
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  isVerified?: boolean;
}

export interface SkillMatch {
  skill: string;
  relevance: number; // 0-100
  found: boolean;
}

export interface SkillDetail {
  name: string;
  category: 'Technical' | 'Soft' | 'Domain';
  proficiency: 'Beginner' | 'Intermediate' | 'Expert';
  importance: 'Critical' | 'Nice-to-have';
}

export interface MissingSkillDetail {
  name: string;
  category: 'Technical' | 'Soft' | 'Domain';
  importance: 'Critical' | 'Nice-to-have';
}

export interface IndustryBenchmarks {
  averageScore: number;
  topPercentileScore: number;
  marketDemand: 'High' | 'Medium' | 'Low';
  typicalCandidateYears: number;
}

export interface AnalysisResult {
  candidateName: string;
  matchScore: number; // 0-100
  summary: string;
  matchedSkills: SkillDetail[];
  missingSkills: MissingSkillDetail[];
  resumeOnlySkills?: string[]; // Skills found in resume but not in JD
  recommendations: string[];
  yearsExperience: number;
  industryBenchmarks?: IndustryBenchmarks;
}

export interface HistoryRecord extends AnalysisResult {
  id: string;
  timestamp: string;
  jobTitle: string; // Extracted or generic
}

export interface Job {
  id: string;
  title: string;
  description: string;
  skills: { 
    name: string; 
    category: 'Technical' | 'Soft' | 'Domain';
    importance?: 'Critical' | 'Nice-to-have';
  }[];
  createdAt: string;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  status: 'active' | 'revoked';
  createdAt: string;
  lastUsed: string;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING', 
  PROCESSING = 'PROCESSING', 
  ANALYZING = 'ANALYZING', 
  GENERATING_ROADMAP = 'GENERATING_ROADMAP',
  GENERATING_JD = 'GENERATING_JD',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type ActiveTab = 'analyzer' | 'path' | 'tasks' | 'jobs' | 'database' | 'api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MindMapNode {
  id: string;
  label: string;
  category: 'Core' | 'Tech' | 'Soft' | 'Domain';
  status: 'acquired' | 'in-progress' | 'missing';
  children?: MindMapNode[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  actionItems: string[];
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  timeEstimate: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  duration: string;
  description: string;
  goals: string[];
  tasks: Task[];
}

export interface Roadmap {
  jobTitle: string;
  startDate?: string;
  interviewDate?: string;
  mindMap: MindMapNode;
  phases: RoadmapPhase[];
}
