import { describe, it, expect } from 'vitest';
import { transformFullRoadmap, transformRoadmapList } from '../lib/transforms';
import type { FullRoadmapResponse } from '../lib/api-client';

// Fixture: mimics the shape returned by GET /v1/roadmaps/{id}
const backendFullRoadmapFixture: FullRoadmapResponse = {
  roadmap: {
    roadmap_id: 'rm-001',
    version: 1,
    summary: 'Learn full-stack development with React and Node.js',
    assumptions: ['Prior JS knowledge'],
    target_outcome: 'Build a production-ready app',
    title: 'Full-Stack Path',
  },
  milestones: [
    {
      roadmap_id: 'rm-001',
      milestone_id: 'ms-001',
      title: 'Frontend Foundations',
      description: 'Learn React basics',
      objective: 'Build components confidently',
      estimated_hours: 10,
      order_index: 0,
      dependency_titles: [],
      prerequisite_milestone_ids: [],
      status: 'ready',
      need_modification: false,
    },
    {
      roadmap_id: 'rm-001',
      milestone_id: 'ms-002',
      title: 'Backend APIs',
      description: 'Build REST APIs with Node.js',
      objective: 'Create CRUD endpoints',
      estimated_hours: 15,
      order_index: 1,
      dependency_titles: ['Frontend Foundations'],
      prerequisite_milestone_ids: ['ms-001'],
      status: 'ready',
      need_modification: false,
    },
  ],
  skillpaths: [
    {
      roadmap_id: 'rm-001',
      skillpath_id: 'sp-001',
      milestone_id: 'ms-001',
      title: 'JSX & Components',
      description: 'Learn JSX syntax and component patterns',
      estimated_hours: 3,
      prerequisite_skillpath_ids: [],
      learning_objectives: ['Write JSX', 'Create functional components'],
      status: 'ready',
      need_generation: false,
      need_modification: false,
      affected_downstream_ids: [],
    },
    {
      roadmap_id: 'rm-001',
      skillpath_id: 'sp-002',
      milestone_id: 'ms-001',
      title: 'State & Props',
      description: 'Understand state management and prop passing',
      estimated_hours: 4,
      prerequisite_skillpath_ids: ['sp-001'],
      learning_objectives: ['Use useState', 'Pass props effectively'],
      status: 'ready',
      need_generation: false,
      need_modification: false,
      affected_downstream_ids: [],
    },
    {
      roadmap_id: 'rm-001',
      skillpath_id: 'sp-003',
      milestone_id: 'ms-002',
      title: 'Express Routing',
      description: 'Set up Express routes and middleware',
      estimated_hours: 5,
      prerequisite_skillpath_ids: [],
      learning_objectives: ['Define routes', 'Use middleware'],
      status: 'ready',
      need_generation: false,
      need_modification: false,
      affected_downstream_ids: [],
    },
  ],
};

// Fixture: mimics the shape returned by GET /v1/roadmaps
const backendRoadmapListFixture = [
  {
    roadmap_id: 'rm-001',
    version: 1,
    title: 'Full-Stack Path',
    summary: 'Learn full-stack development',
    assumptions: [],
    target_outcome: 'Build apps',
  },
  {
    roadmap_id: 'rm-002',
    version: 1,
    title: 'ML Fundamentals',
    summary: 'Machine learning basics',
    assumptions: [],
    target_outcome: 'Train a model',
  },
];

describe('transformFullRoadmap', () => {
  it('transforms backend response into nested frontend Roadmap', () => {
    const result = transformFullRoadmap(backendFullRoadmapFixture);

    expect(result.id).toBe('rm-001');
    expect(result.title).toBe('Full-Stack Path');
    expect(result.description).toBe('Learn full-stack development with React and Node.js');
    expect(result.status).toBe('Active');
    expect(result.progress).toBe(0);
  });

  it('nests skillpaths under their parent milestones', () => {
    const result = transformFullRoadmap(backendFullRoadmapFixture);

    expect(result.milestones).toHaveLength(2);

    const ms1 = result.milestones![0];
    expect(ms1.id).toBe('ms-001');
    expect(ms1.tasks).toHaveLength(2);
    expect(ms1.tasks[0].id).toBe('sp-001');
    expect(ms1.tasks[1].id).toBe('sp-002');

    const ms2 = result.milestones![1];
    expect(ms2.id).toBe('ms-002');
    expect(ms2.tasks).toHaveLength(1);
    expect(ms2.tasks[0].id).toBe('sp-003');
  });

  it('sets first milestone to active, others to ready', () => {
    const result = transformFullRoadmap(backendFullRoadmapFixture);

    expect(result.milestones![0].status).toBe('active');
    expect(result.milestones![0].icon).toBe('Flame');
    expect(result.milestones![1].status).toBe('ready');
    expect(result.milestones![1].icon).toBe('Map');
  });

  it('handles empty skillpaths gracefully', () => {
    const data: FullRoadmapResponse = {
      ...backendFullRoadmapFixture,
      skillpaths: [],
    };
    const result = transformFullRoadmap(data);

    expect(result.milestones![0].tasks).toHaveLength(0);
    expect(result.milestones![1].tasks).toHaveLength(0);
  });

  it('handles empty milestones gracefully', () => {
    const data: FullRoadmapResponse = {
      ...backendFullRoadmapFixture,
      milestones: [],
    };
    const result = transformFullRoadmap(data);

    expect(result.milestones).toHaveLength(0);
    expect(result.milestone).toBe('Starting');
  });
});

describe('transformRoadmapList', () => {
  it('transforms a list of backend roadmaps into frontend shells', () => {
    const result = transformRoadmapList(backendRoadmapListFixture);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('rm-001');
    expect(result[0].title).toBe('Full-Stack Path');
    expect(result[0].milestones).toEqual([]);

    expect(result[1].id).toBe('rm-002');
    expect(result[1].title).toBe('ML Fundamentals');
  });

  it('returns empty array for empty input', () => {
    expect(transformRoadmapList([])).toEqual([]);
  });
});
