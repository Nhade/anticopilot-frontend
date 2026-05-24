import { create } from 'zustand';
import { User, Roadmap, mockUser, mockRoadmaps, mockNotifications, mockPathUpdates } from './mock-data';
import { GoalSpec, LearningProfile, ReviewConcept, GeneratedTask, LearningContentItem, SkillPathItem } from './types';
import * as api from './api-client';
import { createGoalResponseToRoadmapFull, transformFullRoadmap, transformRoadmapList } from './transforms';

// NOTE: We previously wrapped this store in zustand's `persist` middleware to keep
// `activeTab`, `activeContentId`, and `activeRoadmapId` across page reloads (so a user
// resuming a lesson would land back in the Learn view). That caused hydration issues
// with Next.js — first paint used the default values and the store re-hydrated after,
// producing a visible flash. Reverted to in-memory state for now.
//
// To revisit when we have a real backend "where did I leave off" endpoint, or when we
// adopt URL-based routing for the Learn view (?content=...). At that point either:
//   1. Hydrate from the URL/server, or
//   2. Re-introduce `persist` with `skipHydration: true` + a manual hydrate-on-mount
//      effect that suspends initial render via a small client wrapper.

export type GenerationStatus = 'idle' | 'generating' | 'complete' | 'error';
export type ContentGenerationStatus = 'idle' | 'generating' | 'complete' | 'error';

export interface Notification {
  id: number;
  type: string;
  title: string;
  context: string;
  rationale: string;
}

export interface PathUpdate {
  id: number;
  type: string;
  time: string;
  text: string;
}

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

  // Loading & Error State
  roadmapsLoading: boolean;
  roadmapsError: string | null;
  reviewsLoading: boolean;
  reviewsError: string | null;
  generationStatus: GenerationStatus;
  generationError: string | null;

  // Async Actions
  fetchRoadmaps: () => Promise<void>;
  fetchRoadmap: (id: string) => Promise<void>;
  generateRoadmap: (goal: GoalSpec, profile: LearningProfile) => Promise<string>;

  // Content Generation State
  contentGenerationStatus: ContentGenerationStatus;
  contentGenerationError: string | null;
  pendingContentSkillpathId: string | null;
  generateRoadmapContent: (roadmapId: string) => Promise<api.GenerateContentResponse>;
  generateSkillpathContent: (
    roadmapId: string,
    skillpathId: string,
    options?: { force?: boolean }
  ) => Promise<api.GenerateContentResponse>;

  // Skillpath status mutation (Mark complete, future validator)
  updateSkillpathStatus: (
    roadmapId: string,
    skillpathId: string,
    status: api.SkillpathBackendStatus
  ) => Promise<void>;

  // Task Detail
  selectedTaskId: string | null;
  setSelectedTaskId: (taskId: string | null) => void;

  // Learn View (lesson reader)
  activeContentId: string | null;
  setActiveContentId: (contentId: string | null) => void;
  openLearningContent: (contentId: string) => void;
  findLearningContent: (contentId: string) => {
    content: LearningContentItem;
    skillpath: SkillPathItem;
    roadmapId: string;
  } | undefined;

  // User Data
  user: User;

  // Review State
  dueReviews: ReviewConcept[];
  allReviews: ReviewConcept[];
  fetchDueReviews: () => Promise<void>;
  fetchAllReviews: () => Promise<void>;
  submitReviewGrade: (conceptId: string, grade: 1 | 2 | 3 | 4) => Promise<void>;
  generateReviewTask: (conceptId: string) => Promise<GeneratedTask>;

  // Notifications & Path Updates (stub — will connect to real API later)
  notifications: Notification[];
  pathUpdates: PathUpdate[];
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation & UI Defaults
  activeTab: 'roadmap',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isSwitcherOpen: false,
  setSwitcherOpen: (open) => set({ isSwitcherOpen: open }),

  // Roadmap State
  // Start empty; `fetchRoadmaps()` (called on mount in app/page.tsx) will pick
  // the first real roadmap. Using the old `'full-stack-dev'` default caused a
  // brief flash where the active id didn't match any roadmap in the list.
  activeRoadmapId: '',
  roadmaps: mockRoadmaps,
  setRoadmaps: (roadmaps) => set({ roadmaps }),

  // Loading & Error State Defaults
  roadmapsLoading: false,
  roadmapsError: null,
  reviewsLoading: false,
  reviewsError: null,
  generationStatus: 'idle',
  generationError: null,

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
    set({ roadmapsLoading: true, roadmapsError: null });
    try {
      const data = await api.fetchRoadmaps();
      const transformedRoadmaps = transformRoadmapList(data);

      set({ roadmaps: transformedRoadmaps, roadmapsLoading: false });

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
      set({ roadmapsLoading: false, roadmapsError: error instanceof Error ? error.message : 'Failed to fetch roadmaps' });
    }
  },

  fetchRoadmap: async (id: string) => {
    set({ roadmapsLoading: true, roadmapsError: null });
    try {
      const data = await api.fetchRoadmapById(id);
      const transformedRoadmap = transformFullRoadmap(data);

      set((state) => ({
        roadmapsLoading: false,
        roadmaps: state.roadmaps.map(r => r.id === id ? { ...r, ...transformedRoadmap } : r)
      }));
    } catch (error) {
      console.error('Fetch roadmap error:', error);
      set({ roadmapsLoading: false, roadmapsError: error instanceof Error ? error.message : 'Failed to fetch roadmap' });
    }
  },

  // Content Generation State Defaults
  contentGenerationStatus: 'idle',
  contentGenerationError: null,
  pendingContentSkillpathId: null,

  generateRoadmapContent: async (roadmapId) => {
    set({
      contentGenerationStatus: 'generating',
      contentGenerationError: null,
      pendingContentSkillpathId: null,
    });
    try {
      const result = await api.generateRoadmapContent(roadmapId);
      const transformedRoadmap = transformFullRoadmap(result.roadmap);
      set((state) => ({
        contentGenerationStatus: 'complete',
        roadmaps: state.roadmaps.map((r) =>
          r.id === roadmapId ? { ...r, ...transformedRoadmap } : r
        ),
      }));
      return result;
    } catch (error) {
      console.error('Generate roadmap content error:', error);
      const conflictIds =
        error instanceof api.MultiplePendingSkillpathsError
          ? error.pending_skillpath_ids[0] ?? null
          : null;
      set({
        contentGenerationStatus: 'error',
        contentGenerationError:
          error instanceof Error ? error.message : 'Failed to generate content',
        pendingContentSkillpathId: conflictIds,
      });
      throw error;
    }
  },

  updateSkillpathStatus: async (roadmapId, skillpathId, status) => {
    try {
      const refreshed = await api.updateSkillpathStatus(roadmapId, skillpathId, status);
      const transformed = transformFullRoadmap(refreshed);
      set((state) => ({
        roadmaps: state.roadmaps.map((r) =>
          r.id === roadmapId ? { ...r, ...transformed } : r
        ),
      }));
    } catch (error) {
      console.error('Update skillpath status error:', error);
      throw error;
    }
  },

  generateSkillpathContent: async (roadmapId, skillpathId, options) => {
    set({
      contentGenerationStatus: 'generating',
      contentGenerationError: null,
      pendingContentSkillpathId: skillpathId,
    });
    try {
      const result = await api.generateSkillpathContent(roadmapId, skillpathId, options);
      const transformedRoadmap = transformFullRoadmap(result.roadmap);
      set((state) => ({
        contentGenerationStatus: 'complete',
        pendingContentSkillpathId: null,
        roadmaps: state.roadmaps.map((r) =>
          r.id === roadmapId ? { ...r, ...transformedRoadmap } : r
        ),
      }));
      return result;
    } catch (error) {
      console.error('Generate skillpath content error:', error);
      set({
        contentGenerationStatus: 'error',
        contentGenerationError:
          error instanceof Error ? error.message : 'Failed to generate skillpath content',
      });
      throw error;
    }
  },

  generateRoadmap: async (goal, profile) => {
    set({ generationStatus: 'generating', generationError: null });
    try {
      const data = await api.createGoal(goal, profile);
      const transformedRoadmap = transformFullRoadmap(createGoalResponseToRoadmapFull(data));
      // Override title/description with the user's specific request
      transformedRoadmap.title = goal.title;
      transformedRoadmap.description = goal.description;
      transformedRoadmap.stats.pace = profile.pace_preference + ' pace';

      set((state) => ({
        generationStatus: 'complete',
        roadmaps: [...state.roadmaps, transformedRoadmap],
        activeRoadmapId: transformedRoadmap.id,
        activeTab: 'roadmap'
      }));

      return transformedRoadmap.id;
    } catch (error) {
      console.error('Generate roadmap error:', error);
      set({ generationStatus: 'error', generationError: error instanceof Error ? error.message : 'Failed to generate roadmap' });
      throw error;
    }
  },

  // Task Detail Defaults
  selectedTaskId: null,
  setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),

  // Learn View Defaults
  activeContentId: null,
  setActiveContentId: (contentId) => set({ activeContentId: contentId }),
  openLearningContent: (contentId) => {
    set({ activeContentId: contentId, activeTab: 'learn', selectedTaskId: null });
  },
  findLearningContent: (contentId) => {
    const { roadmaps } = get();
    for (const roadmap of roadmaps) {
      for (const milestone of roadmap.milestones || []) {
        for (const task of milestone.tasks || []) {
          const content = (task.learning_contents || []).find((c) => c.content_id === contentId);
          if (content) {
            return {
              content,
              skillpath: task,
              roadmapId: roadmap.roadmap_id || roadmap.id,
            };
          }
        }
      }
    }
    return undefined;
  },

  // User Data Initial Load
  user: mockUser,

  // Review State Defaults
  dueReviews: [],
  allReviews: [],
  fetchDueReviews: async () => {
    set({ reviewsLoading: true, reviewsError: null });
    try {
      const data = await api.fetchDueReviews();
      set({ dueReviews: data, reviewsLoading: false });
    } catch (error) {
      console.error('Fetch due reviews error:', error);
      set({ reviewsLoading: false, reviewsError: error instanceof Error ? error.message : 'Failed to fetch reviews' });
    }
  },
  fetchAllReviews: async () => {
    set({ reviewsLoading: true, reviewsError: null });
    try {
      const data = await api.fetchAllReviews();
      set({ allReviews: data, reviewsLoading: false });
    } catch (error) {
      console.error('Fetch all reviews error:', error);
      set({ reviewsLoading: false, reviewsError: error instanceof Error ? error.message : 'Failed to fetch reviews' });
    }
  },
  submitReviewGrade: async (conceptId, grade) => {
    try {
      await api.submitGrade(conceptId, grade);
      set((state) => ({
        dueReviews: state.dueReviews.filter(r => r.concept_id !== conceptId)
      }));
    } catch (error) {
      console.error('Submit review grade error:', error);
    }
  },
  generateReviewTask: async (conceptId) => {
    return api.generateTask(conceptId);
  },

  // Notifications & Path Updates — currently mock, will connect to API
  notifications: mockNotifications,
  pathUpdates: mockPathUpdates,
}));
