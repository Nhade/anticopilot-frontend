import { create } from 'zustand';
import { User, Roadmap, mockUser, mockRoadmaps } from './mock-data';
import { GoalSpec, LearningProfile, RoadmapItem } from './types';

const API_BASE_URL = 'http://localhost:8000';

interface AppState {
  // Navigation & UI
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSwitcherOpen: boolean;
  setSwitcherOpen: (open: boolean) => void;

  // Roadmap State
  activeRoadmapId: string;
  setActiveRoadmapId: (id: string) => void;
  getActiveRoadmap: () => Roadmap | undefined;
  roadmaps: Roadmap[];
  setRoadmaps: (roadmaps: Roadmap[]) => void;

  // Async Actions
  fetchRoadmap: (id: string) => Promise<void>;
  generateRoadmap: (goal: GoalSpec, profile: LearningProfile) => Promise<string>;

  // Task Detail
  selectedTaskId: string | null;
  setSelectedTaskId: (taskId: string | null) => void;

  // User Data
  user: User;
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation & UI Defaults
  activeTab: 'roadmap',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isSwitcherOpen: false,
  setSwitcherOpen: (open) => set({ isSwitcherOpen: open }),

  // Roadmap State
  activeRoadmapId: 'full-stack-dev',
  roadmaps: mockRoadmaps,
  setRoadmaps: (roadmaps) => set({ roadmaps }),

  setActiveRoadmapId: (id) => {
    set({ activeRoadmapId: id, isSwitcherOpen: false });
  },

  getActiveRoadmap: () => {
    const { activeRoadmapId, roadmaps } = get();
    return roadmaps.find(r => r.id === activeRoadmapId);
  },

  // Async Actions Implementation
  fetchRoadmap: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/roadmaps/${id}`);
      if (!response.ok) throw new Error('Failed to fetch roadmap');
      const data = await response.json();

      set((state) => ({
        roadmaps: state.roadmaps.map(r => r.id === id ? { ...r, ...data } : r)
      }));
    } catch (error) {
      console.error('Fetch roadmap error:', error);
    }
  },

  generateRoadmap: async (goal, profile) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal_spec: goal, learning_profile: profile })
      });

      if (!response.ok) throw new Error('Failed to generate roadmap');
      const data = await response.json();

      const newRoadmapId = data.roadmap_id;

      const newRoadmap: Roadmap = {
        ...data.roadmap,
        id: newRoadmapId,
        title: goal.title,
        status: 'Active',
        description: goal.description,
        stats: { reviewsDue: 0, pace: profile.pace_preference + ' pace', lastActive: 'Just now' },
        milestone: data.milestones[0]?.title || 'Starting',
        progress: 0,
        linkedProject: null,
        icon: 'Target',
        iconColor: 'text-active',
        iconBg: 'bg-active/10',
        themeStatus: 'Active',
        borderTheme: 'border-active/30 dark:border-active/50 shadow-xl shadow-active/10',
        bgTheme: 'bg-white dark:bg-zinc-900/80 border-2',
        milestones: data.milestones.map((m: any, idx: number) => ({
          ...m,
          id: m.milestone_id,
          status: idx === 0 ? 'active' : 'ready',
          icon: idx === 0 ? 'Flame' : 'Map',
          tasks: data.skillpaths
            .filter((s: any) => s.milestone_id === m.milestone_id)
            .map((s: any) => ({
              ...s,
              id: s.skillpath_id,
              title: s.title,
              subtitle: s.description,
              status: idx === 0 ? 'active' : 'ready',
              icon: 'Play'
            }))
        }))
      };

      set((state) => ({
        roadmaps: [...state.roadmaps, newRoadmap],
        activeRoadmapId: newRoadmapId,
        activeTab: 'roadmap'
      }));

      return newRoadmapId;
    } catch (error) {
      console.error('Generate roadmap error:', error);
      throw error;
    }
  },

  // Task Detail Defaults
  selectedTaskId: null,
  setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),

  // User Data Initial Load
  user: mockUser,
}));
