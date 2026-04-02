export interface User {
  name: string;
  streak: number;
  level: string;
}

export interface Task {
  id?: string;
  title: string;
  subtitle: string;
  status: "active" | "upcoming" | "completed" | "review";
  type?: "learn" | "practice" | "apply" | "optional";
  icon?: string; // Icon name from lucide
}

export interface Milestone {
  id: string;
  title: string;
  subtitle?: string;
  status: "active" | "completed" | "upcoming";
  icon: string;
  eta?: string;
  why?: string;
  tasks: Task[];
  mastery?: "review" | "solid";
  masteryText?: string;
  sideQuest?: {
    title: string;
    type: string;
    description: string;
  };
}

export interface Roadmap {
  id: string;
  title: string;
  status: "Active" | "Paused" | "Completed" | "Archived";
  description: string;
  stats: {
    reviewsDue: number;
    pace: string;
    lastActive: string;
  };
  milestone: string; // Current milestone title
  progress: number;
  linkedProject: string | null;
  icon: string;
  iconColor: string;
  iconBg: string;
  themeStatus: string;
  borderTheme: string;
  bgTheme: string;
  milestones?: Milestone[];
}
