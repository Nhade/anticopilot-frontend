import { create } from 'zustand';
import { User, Roadmap, mockUser, mockRoadmaps } from './mock-data';
import { GoalSpec, LearningProfile, ReviewConcept, GeneratedTask, LearningContentItem, SkillPathItem } from './types';
import * as api from './api-client';
import { createMockDiscoveryConversation, sendMockDiscoveryMessage } from './discovery-mock';
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

// --- Discovery (conversational roadmap creation) ---
// Flow per backend PR #13: create a conversation, exchange messages (the agent
// returns ui_hints describing how to render each question), and when
// session_complete arrives treat it as "roadmap generation has started" — there
// is no job-status endpoint, so we poll the roadmap list until the new roadmap
// shows up with milestones persisted.

export type DiscoveryStatus =
  | 'idle'
  | 'starting'
  | 'awaiting_user'
  | 'awaiting_agent'
  | 'generating_roadmap'
  | 'error';

export interface DiscoveryMessage {
  role: 'user' | 'agent';
  text: string;
}

export interface DiscoveryState {
  conversationId: string | null;
  isMock: boolean;
  messages: DiscoveryMessage[];
  uiHints: api.UIHints | null;
  status: DiscoveryStatus;
  error: string | null;
  lastUserMessage: string | null;
  roadmapJobId: string | null;
  // Roadmap ids that existed before this session — the generated roadmap is
  // whichever id later appears that is not in this set.
  knownRoadmapIds: string[];
}

const DISCOVERY_INTRO: DiscoveryMessage = {
  role: 'agent',
  text: "Hi! I'm here to help turn what you want to learn into a concrete roadmap. What would you like to learn or build?",
};

const initialDiscoveryState: DiscoveryState = {
  conversationId: null,
  isMock: false,
  messages: [],
  uiHints: null,
  status: 'idle',
  error: null,
  lastUserMessage: null,
  roadmapJobId: null,
  knownRoadmapIds: [],
};

const DISCOVERY_POLL_INTERVAL_MS = 5000;
const DISCOVERY_POLL_TIMEOUT_MS = 10 * 60 * 1000;

let discoveryPollTimer: ReturnType<typeof setTimeout> | null = null;

function clearDiscoveryPollTimer() {
  if (discoveryPollTimer) {
    clearTimeout(discoveryPollTimer);
    discoveryPollTimer = null;
  }
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
  customizeMilestone: (
    roadmapId: string,
    milestoneId: string,
    payload: api.MilestoneCustomizationPayload
  ) => Promise<api.MilestoneCustomizationResponse>;

  // Discovery (conversational roadmap creation)
  discovery: DiscoveryState;
  startDiscovery: () => Promise<void>;
  sendDiscoveryMessage: (text: string, options?: { isRetry?: boolean }) => Promise<void>;
  resetDiscovery: () => void;

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
  // Per-lesson completion is client-side (session-only) — the backend tracks
  // completion per-skillpath. When every lesson in a skillpath is marked, the
  // skillpath-complete API fires automatically.
  completedContentIds: Record<string, true>;
  markLessonComplete: (
    roadmapId: string,
    skillpath: SkillPathItem,
    contentId: string
  ) => Promise<void>;

  // User Data
  user: User;

  // Review State
  dueReviews: ReviewConcept[];
  allReviews: ReviewConcept[];
  fetchDueReviews: () => Promise<void>;
  fetchAllReviews: () => Promise<void>;
  submitReviewGrade: (conceptId: string, grade: 1 | 2 | 3 | 4) => Promise<void>;
  generateReviewTask: (conceptId: string) => Promise<GeneratedTask>;
}

export const useStore = create<AppState>((set, get) => {
  // Polls the roadmap list until a roadmap not present at session start shows
  // up with milestones persisted (the roadmap row can land before its
  // milestones do), then activates it and leaves the discovery flow.
  const pollForDiscoveryRoadmap = (conversationId: string) => {
    const startedAt = Date.now();

    const tick = async () => {
      const { discovery } = get();
      // Bail out if the session was reset or replaced while we were waiting.
      if (discovery.conversationId !== conversationId || discovery.status !== 'generating_roadmap') {
        return;
      }

      if (discovery.isMock) {
        // Nothing real to poll — hand the user back to their roadmaps so the
        // full flow stays walkable without the backend.
        set({ activeTab: 'roadmap', discovery: { ...initialDiscoveryState } });
        return;
      }

      try {
        const list = await api.fetchRoadmaps();
        const known = new Set(discovery.knownRoadmapIds);
        const fresh = list.find((r) => !known.has(r.roadmap_id));
        if (fresh) {
          const full = await api.fetchRoadmapById(fresh.roadmap_id);
          if (full.milestones && full.milestones.length > 0) {
            await get().fetchRoadmaps();
            get().setActiveRoadmapId(fresh.roadmap_id);
            set({ activeTab: 'roadmap', discovery: { ...initialDiscoveryState } });
            return;
          }
        }
      } catch {
        // Transient fetch failure — keep polling until the deadline.
      }

      if (Date.now() - startedAt > DISCOVERY_POLL_TIMEOUT_MS) {
        const current = get().discovery;
        if (current.conversationId === conversationId) {
          set({
            discovery: {
              ...current,
              status: 'error',
              error:
                'Roadmap generation is taking longer than expected. It may still finish — check Manage Roadmaps in a bit.',
            },
          });
        }
        return;
      }

      discoveryPollTimer = setTimeout(tick, DISCOVERY_POLL_INTERVAL_MS);
    };

    clearDiscoveryPollTimer();
    discoveryPollTimer = setTimeout(tick, get().discovery.isMock ? 4000 : DISCOVERY_POLL_INTERVAL_MS);
  };

  return {
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

  customizeMilestone: async (roadmapId, milestoneId, payload) => {
    const result = await api.customizeMilestone(roadmapId, milestoneId, payload);
    // Applied edits change milestone fields and may flag skillpaths stale —
    // refetch so the roadmap view reflects backend truth, not local state.
    if (result.applied) {
      await get().fetchRoadmap(roadmapId);
    }
    return result;
  },

  // Discovery Defaults & Actions
  discovery: { ...initialDiscoveryState },

  startDiscovery: async () => {
    clearDiscoveryPollTimer();
    set({
      activeTab: 'discovery',
      isSwitcherOpen: false,
      discovery: { ...initialDiscoveryState, status: 'starting' },
    });

    // Snapshot the roadmaps that exist before this session so the poller can
    // recognize the generated one later. Falls back to store state when the
    // backend is unreachable (mock mode won't poll anyway).
    let knownRoadmapIds: string[];
    try {
      knownRoadmapIds = (await api.fetchRoadmaps()).map((r) => r.roadmap_id);
    } catch {
      knownRoadmapIds = get().roadmaps.map((r) => r.roadmap_id || r.id);
    }

    let conversationId: string;
    let isMock = false;
    try {
      conversationId = await api.createDiscoveryConversation();
    } catch (error) {
      // Backend without /v1/discovery routes (PR #13 not merged) or not
      // running at all — fall back to the scripted mock conversation so the
      // flow stays demoable.
      console.warn('Discovery API unavailable, using mock conversation:', error);
      conversationId = createMockDiscoveryConversation();
      isMock = true;
    }

    // Conversation creation returns no agent message, so the opener is ours.
    set({
      discovery: {
        ...initialDiscoveryState,
        conversationId,
        isMock,
        knownRoadmapIds,
        messages: [DISCOVERY_INTRO],
        uiHints: { type: 'text_input', options: [] },
        status: 'awaiting_user',
      },
    });
  },

  sendDiscoveryMessage: async (text, options) => {
    const discovery = get().discovery;
    const trimmed = text.trim();
    if (!trimmed || !discovery.conversationId) return;
    if (discovery.status !== 'awaiting_user' && discovery.status !== 'error') return;

    set({
      discovery: {
        ...discovery,
        messages: options?.isRetry
          ? discovery.messages
          : [...discovery.messages, { role: 'user', text: trimmed }],
        uiHints: null,
        status: 'awaiting_agent',
        error: null,
        lastUserMessage: trimmed,
      },
    });

    try {
      const response = discovery.isMock
        ? await sendMockDiscoveryMessage(discovery.conversationId)
        : await api.sendDiscoveryMessage(discovery.conversationId, trimmed);

      const current = get().discovery;
      if (current.conversationId !== discovery.conversationId) return;

      const messages: DiscoveryMessage[] = [
        ...current.messages,
        { role: 'agent', text: response.message },
      ];

      if (response.session_complete) {
        set({
          discovery: {
            ...current,
            messages,
            uiHints: null,
            status: 'generating_roadmap',
            roadmapJobId: response.roadmap_job_id ?? null,
          },
        });
        pollForDiscoveryRoadmap(discovery.conversationId);
      } else {
        set({
          discovery: {
            ...current,
            messages,
            // The composer stays available either way; ui_hints only add
            // option buttons for choice/confirm turns.
            uiHints: response.ui_hints ?? { type: 'text_input', options: [] },
            status: 'awaiting_user',
          },
        });
      }
    } catch (error) {
      console.error('Discovery message error:', error);
      const current = get().discovery;
      if (current.conversationId !== discovery.conversationId) return;
      set({
        discovery: {
          ...current,
          status: 'error',
          error: error instanceof Error ? error.message : 'Discovery agent failed to reply',
        },
      });
    }
  },

  resetDiscovery: () => {
    clearDiscoveryPollTimer();
    set({ discovery: { ...initialDiscoveryState } });
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
  completedContentIds: {},
  markLessonComplete: async (roadmapId, skillpath, contentId) => {
    const current = get().completedContentIds;
    if (current[contentId]) return;
    const next: Record<string, true> = { ...current, [contentId]: true };
    set({ completedContentIds: next });

    const contents = skillpath.learning_contents || [];
    const allDone =
      contents.length > 0 && contents.every((c) => next[c.content_id]);
    if (allDone && skillpath.status !== 'completed') {
      try {
        await get().updateSkillpathStatus(roadmapId, skillpath.skillpath_id, 'completed');
      } catch (error) {
        // Roll back the local mark so the user can retry the final lesson.
        const rollback = { ...get().completedContentIds };
        delete rollback[contentId];
        set({ completedContentIds: rollback });
        throw error;
      }
    }
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
  };
});
