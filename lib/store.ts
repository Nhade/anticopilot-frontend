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
  fetchRoadmaps: () => Promise<void>;
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
    // Fetch details if they are not already loaded
    const roadmap = get().roadmaps.find(r => r.id === id);
    if (roadmap && (!roadmap.milestones || roadmap.milestones.length === 0)) {
      get().fetchRoadmap(id);
    }
  },

  getActiveRoadmap: () => {
    const { activeRoadmapId, roadmaps } = get();
    return roadmaps.find(r => r.id === activeRoadmapId);
  },

  // Async Actions Implementation
  fetchRoadmaps: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/roadmaps`);
      if (!response.ok) throw new Error('Failed to fetch roadmaps');
      const data = await response.json();

      const transformedRoadmaps: Roadmap[] = data.map((r: any) => ({
        ...r,
        id: r.roadmap_id,
        title: r.title,
        status: 'Active',
        description: r.summary,
        stats: { reviewsDue: 0, pace: 'balanced pace', lastActive: 'Recently' },
        milestone: 'Loading...',
        progress: 0,
        linkedProject: null,
        icon: 'Target',
        iconColor: 'text-active',
        iconBg: 'bg-active/10',
        themeStatus: 'Active',
        borderTheme: 'border-active/30 dark:border-active/50 shadow-xl shadow-active/10',
        bgTheme: 'bg-white dark:bg-zinc-900/80 border-2',
        milestones: [] // Fetch details when selected
      }));

      set({ roadmaps: transformedRoadmaps });
      
      // If there are roadmaps but none is active, set the first one as active
      // Also, fetch details for the active roadmap immediately
      const currentActiveId = get().activeRoadmapId;
      if (transformedRoadmaps.length > 0) {
        let activeId = currentActiveId;
        if (!currentActiveId || !transformedRoadmaps.find(r => r.id === currentActiveId)) {
          activeId = transformedRoadmaps[0].id;
          set({ activeRoadmapId: activeId });
        }
        get().fetchRoadmap(activeId);
      }
    } catch (error) {
      console.error('Fetch roadmaps error:', error);
    }
  },

  fetchRoadmap: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/roadmaps/${id}`);
      if (!response.ok) throw new Error('Failed to fetch roadmap');
      const data = await response.json();

      const transformedRoadmap = transformFullRoadmap(data);

      set((state) => ({
        roadmaps: state.roadmaps.map(r => r.id === id ? { ...r, ...transformedRoadmap } : r)
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

      const transformedRoadmap = transformFullRoadmap(data);
      // Override title/description with the user's specific request
      transformedRoadmap.title = goal.title;
      transformedRoadmap.description = goal.description;
      transformedRoadmap.stats.pace = profile.pace_preference + ' pace';

      set((state) => ({
        roadmaps: [...state.roadmaps, transformedRoadmap],
        activeRoadmapId: transformedRoadmap.id,
        activeTab: 'roadmap'
      }));

      return transformedRoadmap.id;
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

/**
 * Helper to transform backend detailed roadmap data into a frontend Roadmap structure.
 */
function transformFullRoadmap(data: any): Roadmap {
  const { roadmap, milestones, skillpaths } = data;
  return {
    ...roadmap,
    id: roadmap.roadmap_id,
    title: roadmap.title,
    status: 'Active',
    description: roadmap.summary,
    stats: { reviewsDue: 0, pace: 'balanced pace', lastActive: 'Recently' },
    milestone: milestones[0]?.title || 'Starting',
    progress: 0,
    linkedProject: null,
    icon: 'Target',
    iconColor: 'text-active',
    iconBg: 'bg-active/10',
    themeStatus: 'Active',
    borderTheme: 'border-active/30 dark:border-active/50 shadow-xl shadow-active/10',
    bgTheme: 'bg-white dark:bg-zinc-900/80 border-2',
    milestones: milestones.map((m: any, idx: number) => ({
      ...m,
      id: m.milestone_id,
      status: idx === 0 ? 'active' : 'ready',
      icon: idx === 0 ? 'Flame' : 'Map',
      tasks: (skillpaths || [])
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
}
