import { User, Roadmap, Task, Milestone } from "./types";
export type { User, Roadmap, Task, Milestone };

export const mockUser: User = {
  name: "Alex",
  streak: 14,
  level: "Intermediate Architect",
};

export const mockRoadmaps: Roadmap[] = [
  {
    id: "full-stack-dev",
    roadmap_id: "full-stack-dev",
    version: 1,
    summary: "Mastering React, Node, and Postgres for modern app development.",
    assumptions: ["Fast-track preferred", "Prior JS knowledge"],
    target_outcome: "Build a production-ready task manager",
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
        roadmap_id: "full-stack-dev",
        milestone_id: "m1",
        order_index: 0,
        description: "Focus on React state management patterns",
        objective: "Handle complex state safely",
        estimated_hours: 12,
        dependency_titles: [],
        prerequisite_milestone_ids: [],
        status: "active",
        title: "Advanced State Management",
        eta: "~3 days at your pace",
        icon: "Map",
        why: "Your 'Task Manager' project needs to share user authentication state across deeply nested components. We're skipping generic Redux and jumping straight to React Context + Reducers because it elegantly solves your exact problem.",
        need_modification: false,
        tasks: [
          {
            id: "s1", roadmap_id: "full-stack-dev", skillpath_id: "s1", milestone_id: "m1", title: "React Context API Patterns", subtitle: "Fix your prop-drilling issue", status: "active", type: "learn", icon: "Play",
            description: "Deep dive into Context providers", estimated_hours: 2, prerequisite_skillpath_ids: [], learning_objectives: ["Create and consume context"], need_generation: false, need_modification: false, affected_downstream_ids: []
          },
          {
            id: "s2", roadmap_id: "full-stack-dev", skillpath_id: "s2", milestone_id: "m1", title: "The useReducer pattern", subtitle: "Manage complex state logic clearly", status: "upcoming", type: "practice", icon: "Target",
            description: "Using reducers instead of state", estimated_hours: 4, prerequisite_skillpath_ids: ["s1"], learning_objectives: ["Write pure reducers"], need_generation: false, need_modification: false, affected_downstream_ids: []
          },
          {
            id: "s3", roadmap_id: "full-stack-dev", skillpath_id: "s3", milestone_id: "m1", title: "Apply Context to Auth Flow", subtitle: "Project Integration", status: "upcoming", type: "apply", icon: "Code2",
            description: "Integrate with login flow", estimated_hours: 6, prerequisite_skillpath_ids: ["s2"], learning_objectives: ["Global auth state"], need_generation: false, need_modification: false, affected_downstream_ids: []
          }
        ],
        sideQuest: {
          title: "Optional Side Quest",
          type: "Targeted Practice",
          description: "I noticed you spent 15 minutes debugging an infinite useEffect loop yesterday. Want to take a 20-minute detour to deeply master the Dependency Array rules?"
        }
      },
      {
        id: "m2",
        roadmap_id: "full-stack-dev",
        milestone_id: "m2",
        order_index: 1,
        description: "Backend architecture and DB integration",
        objective: "Connect to database",
        estimated_hours: 20,
        dependency_titles: ["Advanced State Management"],
        prerequisite_milestone_ids: ["m1"],
        status: "upcoming",
        title: "Database & APIs",
        subtitle: "Connecting your React application to Prisma and transitioning your route logic.",
        eta: "~1.5 weeks at your pace",
        icon: "Code2",
        why: "Connect frontend to backend",
        need_modification: false,
        tasks: [
          {
            id: "s4", roadmap_id: "full-stack-dev", skillpath_id: "s4", milestone_id: "m2", title: "Node.js & Express Basics", subtitle: "REST API foundations", status: "upcoming", type: "learn", icon: "Map",
            description: "Backend setup", estimated_hours: 4, prerequisite_skillpath_ids: [], learning_objectives: ["API routes"], need_generation: false, need_modification: false, affected_downstream_ids: []
          }
        ]
      }
    ]
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
