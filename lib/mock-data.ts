import { User, Roadmap, Task, Milestone } from "./types";

export const mockUser: User = {
  name: "Alex",
  streak: 14,
  level: "Intermediate Architect",
};

export const mockRoadmaps: Roadmap[] = [
  {
    id: "full-stack-dev",
    title: "Full-Stack Dev",
    status: "Active",
    description: "Mastering React, Node, and Postgres for modern app development.",
    stats: { reviewsDue: 2, pace: "5h/wk", lastActive: "Today" },
    milestone: "Auth & State",
    progress: 65,
    linkedProject: "Task Manager App",
    icon: "Target",
    iconColor: "text-active",
    iconBg: "bg-active/10",
    themeStatus: "Active",
    borderTheme: "border-active/30 dark:border-active/50 shadow-xl shadow-active/10",
    bgTheme: "bg-white dark:bg-zinc-900/80 border-2",
    milestones: [
      {
        id: "m1",
        status: "active",
        title: "Advanced State Management",
        eta: "~3 days at your pace",
        icon: "Map",
        why: "Your 'Task Manager' project needs to share user authentication state across deeply nested components. We're skipping generic Redux and jumping straight to React Context + Reducers because it elegantly solves your exact problem.",
        tasks: [
          { title: "React Context API Patterns", subtitle: "Fix your prop-drilling issue", status: "active", type: "learn", icon: "Play" },
          { title: "The useReducer pattern", subtitle: "Manage complex state logic clearly", status: "upcoming", type: "practice", icon: "Target" },
          { title: "Apply Context to Auth Flow", subtitle: "Project Integration", status: "upcoming", type: "apply", icon: "Code2" }
        ],
        sideQuest: {
          title: "Optional Side Quest",
          type: "Targeted Practice",
          description: "I noticed you spent 15 minutes debugging an infinite useEffect loop yesterday. Want to take a 20-minute detour to deeply master the Dependency Array rules?"
        }
      },
      {
        id: "m2",
        status: "upcoming",
        title: "Database & APIs",
        subtitle: "Connecting your React application to Prisma and transitioning your route logic.",
        eta: "~1.5 weeks at your pace",
        icon: "Code2",
        tasks: [
          { title: "Node.js & Express Basics", subtitle: "REST API foundations", status: "upcoming", type: "learn", icon: "Map" },
          { title: "Prisma Schema Modeling", subtitle: "Define your User and Task models", status: "upcoming", type: "practice", icon: "Target" },
          { title: "Connecting UI to backend", subtitle: "React Query integration", status: "upcoming", type: "apply", icon: "Code2" }
        ]
      }
    ]
  },
  {
    id: "typescript-mastery",
    title: "TypeScript Mastery",
    status: "Paused",
    description: "Leveling up from `any` to strict generic architectures.",
    stats: { reviewsDue: 0, pace: "2h/wk", lastActive: "Sep 12" },
    milestone: "Utility Types",
    progress: 30,
    linkedProject: null,
    icon: "Code2",
    iconColor: "text-slate-500",
    iconBg: "bg-slate-100 dark:bg-zinc-800",
    themeStatus: "Paused",
    borderTheme: "border-slate-200 dark:border-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm dark:shadow-none",
    bgTheme: "bg-white/40 dark:bg-zinc-900/40 border"
  }
];

export const mockNotifications = [
  { id: 1, type: "review", title: "useEffect dependencies", context: "AuthModal.tsx", rationale: "Repeated issue yesterday" },
  { id: 2, type: "ai", title: "LocalStorage Limits", context: "Task Manager", rationale: "Suggested by AI" }
];

export const mockPathUpdates = [
  { id: 1, type: "refresh", time: "2 hours ago", text: "Inserted dependency-array refresher after repeated useEffect bug." },
  { id: 2, type: "skip", time: "Yesterday", text: "Skipped Redux because the current project only needs local auth state." },
  { id: 3, type: "move", time: "3 days ago", text: "Moved Context API ahead of database work to unblock UI development." }
];

export const getRoadmapById = (id: string) => mockRoadmaps.find(r => r.id === id);
