import { Roadmap, Milestone, Task } from './types';
import { FullRoadmapResponse } from './api-client';

/**
 * Transforms the flat backend response (roadmap + milestones + skillpaths)
 * into the nested frontend Roadmap structure.
 */
export function transformFullRoadmap(data: FullRoadmapResponse): Roadmap {
  const { roadmap, milestones, skillpaths } = data;
  return {
    ...roadmap,
    id: roadmap.roadmap_id,
    title: roadmap.title ?? roadmap.roadmap_id,
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
