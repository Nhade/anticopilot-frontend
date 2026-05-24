import { Roadmap, Milestone, Task } from './types';
import { CreateGoalResponse, RoadmapFull } from './api-client';

/**
 * Adapts the current create-goal response into the canonical nested read shape.
 */
export function createGoalResponseToRoadmapFull(data: CreateGoalResponse): RoadmapFull {
  const { roadmap, milestones, skillpaths } = data;
  return {
    ...roadmap,
    roadmap_id: data.roadmap_id || roadmap.roadmap_id,
    milestones: milestones.map((milestone: any) => ({
      ...milestone,
      skillpaths: (skillpaths || []).filter(
        (skillpath: any) => skillpath.milestone_id === milestone.milestone_id
      ),
    })),
  };
}

/**
 * Pick the user's current focus position: the first non-completed skillpath in
 * the first non-completed milestone (after sorting by order_index for milestones,
 * and trusting backend topo-sort for skillpaths within a milestone).
 *
 * Returns nulls if everything is completed (or there are no skillpaths).
 */
function deriveActivePosition(sortedMilestones: any[]): {
  activeMilestoneId: string | null;
  activeSkillpathId: string | null;
} {
  for (const m of sortedMilestones) {
    if (m.status === 'completed') continue;
    const candidate = (m.skillpaths || []).find(
      (s: any) => s.status !== 'completed'
    );
    if (candidate) {
      return {
        activeMilestoneId: m.milestone_id,
        activeSkillpathId: candidate.skillpath_id,
      };
    }
  }
  return { activeMilestoneId: null, activeSkillpathId: null };
}

/**
 * Transforms the canonical nested backend RoadmapFull response into UI state.
 *
 * Status handling: backend `status` (ready/generated/revising/completed/revised)
 * is preserved as-is. The UI-only `'active'` flag is overlaid on the one
 * skillpath the user should focus on right now (and its parent milestone),
 * derived from order + completion. This lets a backend-driven `completed`
 * status flow through correctly and lets `active` move forward as work
 * progresses.
 */
export function transformFullRoadmap(data: RoadmapFull): Roadmap {
  const sortedMilestones = [...data.milestones].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );
  const { activeMilestoneId, activeSkillpathId } = deriveActivePosition(sortedMilestones);
  const activeMilestoneTitle =
    sortedMilestones.find((m) => m.milestone_id === activeMilestoneId)?.title
    ?? sortedMilestones[0]?.title
    ?? 'Starting';

  return {
    ...data,
    id: data.roadmap_id,
    title: data.title ?? data.roadmap_id,
    status: 'Active',
    description: data.summary,
    stats: { reviewsDue: 0, pace: 'balanced pace', lastActive: 'Recently' },
    milestone: activeMilestoneTitle,
    progress: 0,
    linkedProject: null,
    icon: 'Target',
    iconColor: 'text-active',
    iconBg: 'bg-active/10',
    themeStatus: 'Active',
    borderTheme: 'border-active/30 dark:border-active/50 shadow-xl shadow-active/10',
    bgTheme: 'bg-white dark:bg-zinc-900/80 border-2',
    milestones: sortedMilestones.map((m: any) => {
      const isActiveMilestone = m.milestone_id === activeMilestoneId;
      return {
        ...m,
        id: m.milestone_id,
        status: isActiveMilestone ? 'active' : m.status,
        icon: isActiveMilestone ? 'Flame' : 'Map',
        tasks: (m.skillpaths || []).map((s: any) => ({
          ...s,
          roadmap_id: s.roadmap_id || data.roadmap_id,
          id: s.skillpath_id,
          title: s.title,
          subtitle: s.description,
          status: s.skillpath_id === activeSkillpathId ? 'active' : s.status,
          icon: 'Play',
        })),
      };
    }),
  };
}

/**
 * Transforms a list of raw roadmap items from GET /v1/roadmaps
 * into frontend Roadmap shells (without milestones loaded).
 */
export function transformRoadmapList(data: any[]): Roadmap[] {
  return data.map((r: any) => ({
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
    milestones: []
  }));
}
