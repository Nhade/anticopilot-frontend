import { create } from 'zustand';
import { User, Roadmap, mockUser, mockRoadmaps } from './mock-data';

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
  
  // Task Detail
  selectedTaskId: string | null;
  setSelectedTaskId: (taskId: string | null) => void;
  
  // User Data (for simulated sync)
  user: User;
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation & UI Defaults
  activeTab: 'roadmap',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isSwitcherOpen: false,
  setSwitcherOpen: (open) => set({ isSwitcherOpen: open }),
  
  // Roadmap State Defaults
  activeRoadmapId: 'full-stack-dev',
  setActiveRoadmapId: (id) => set({ activeRoadmapId: id, isSwitcherOpen: false }),
  getActiveRoadmap: () => {
    const { activeRoadmapId } = get();
    return mockRoadmaps.find(r => r.id === activeRoadmapId);
  },
  
  // Task Detail Defaults
  selectedTaskId: null,
  setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),
  
  // User Data Initial Load
  user: mockUser,
}));
