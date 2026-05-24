import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGoalResponseToRoadmapFull, transformFullRoadmap, transformRoadmapList } from '../lib/transforms';
import {
  formatApiErrorDetail,
  generateRoadmapContent,
  generateSkillpathContent,
  MultiplePendingSkillpathsError,
} from '../lib/api-client';
import type { CreateGoalResponse, RoadmapFull } from '../lib/api-client';
import type {
  ArticleLearningContent,
  CodingProblemLearningContent,
  LearningContentItem,
  MultipleChoiceLearningContent,
} from '../lib/types';

// Fixture: mimics the flat shape returned by POST /v1/goals
const backendCreateGoalFixture: CreateGoalResponse = {
  roadmap_id: 'rm-001',
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

// Fixture: mimics the nested shape returned by GET /v1/roadmaps/{id}
const backendFullRoadmapFixture: RoadmapFull = createGoalResponseToRoadmapFull(backendCreateGoalFixture);

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
  it('adapts flat creation responses into nested RoadmapFull', () => {
    const adapted = createGoalResponseToRoadmapFull(backendCreateGoalFixture);

    expect(adapted.roadmap_id).toBe('rm-001');
    expect(adapted.milestones[0].skillpaths).toHaveLength(2);
    expect(adapted.milestones[1].skillpaths).toHaveLength(1);
  });

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

  it('sorts milestones by order_index even when backend returns them shuffled', () => {
    const shuffled: RoadmapFull = {
      ...backendFullRoadmapFixture,
      milestones: [
        backendFullRoadmapFixture.milestones[1], // order_index: 1
        backendFullRoadmapFixture.milestones[0], // order_index: 0
      ],
    };
    const result = transformFullRoadmap(shuffled);

    expect(result.milestones![0].id).toBe('ms-001');
    expect(result.milestones![0].status).toBe('active');
    expect(result.milestones![1].id).toBe('ms-002');
    expect(result.milestones![1].status).toBe('ready');
  });

  it('sets first milestone to active, others to ready', () => {
    const result = transformFullRoadmap(backendFullRoadmapFixture);

    expect(result.milestones![0].status).toBe('active');
    expect(result.milestones![0].icon).toBe('Flame');
    expect(result.milestones![1].status).toBe('ready');
    expect(result.milestones![1].icon).toBe('Map');
  });

  it('handles empty skillpaths gracefully', () => {
    const data: RoadmapFull = createGoalResponseToRoadmapFull({
      ...backendCreateGoalFixture,
      skillpaths: [],
    });
    const result = transformFullRoadmap(data);

    expect(result.milestones![0].tasks).toHaveLength(0);
    expect(result.milestones![1].tasks).toHaveLength(0);
  });

  it('handles empty milestones gracefully', () => {
    const data: RoadmapFull = {
      ...backendFullRoadmapFixture,
      milestones: [],
    };
    const result = transformFullRoadmap(data);

    expect(result.milestones).toHaveLength(0);
    expect(result.milestone).toBe('Starting');
  });

  it('preserves backend completed status on a skillpath', () => {
    const completedFirst = createGoalResponseToRoadmapFull({
      ...backendCreateGoalFixture,
      skillpaths: backendCreateGoalFixture.skillpaths.map((sp, idx) =>
        idx === 0 ? { ...sp, status: 'completed' } : sp
      ),
    });
    const result = transformFullRoadmap(completedFirst);

    // First task in milestone 0 was 'completed' from backend — preserve that.
    expect(result.milestones![0].tasks[0].status).toBe('completed');
  });

  it('advances active to the next skillpath when the current one is completed', () => {
    const advanced = createGoalResponseToRoadmapFull({
      ...backendCreateGoalFixture,
      skillpaths: backendCreateGoalFixture.skillpaths.map((sp, idx) =>
        idx === 0 ? { ...sp, status: 'completed' } : sp
      ),
    });
    const result = transformFullRoadmap(advanced);

    // sp-001 completed → sp-002 becomes active.
    expect(result.milestones![0].tasks[0].status).toBe('completed');
    expect(result.milestones![0].tasks[1].status).toBe('active');
    expect(result.milestones![0].status).toBe('active');
  });

  it('advances active to next milestone when current milestone is fully completed', () => {
    const milestoneOneDone = createGoalResponseToRoadmapFull({
      ...backendCreateGoalFixture,
      milestones: backendCreateGoalFixture.milestones.map((m, idx) =>
        idx === 0 ? { ...m, status: 'completed' } : m
      ),
      skillpaths: backendCreateGoalFixture.skillpaths.map((sp) =>
        sp.milestone_id === 'ms-001' ? { ...sp, status: 'completed' } : sp
      ),
    });
    const result = transformFullRoadmap(milestoneOneDone);

    // ms-001 completed → ms-002 becomes active; its only skillpath gets active.
    expect(result.milestones![0].status).toBe('completed');
    expect(result.milestones![1].status).toBe('active');
    expect(result.milestones![1].tasks[0].status).toBe('active');
  });

  it('marks nothing active when every skillpath is completed', () => {
    const allDone = createGoalResponseToRoadmapFull({
      ...backendCreateGoalFixture,
      milestones: backendCreateGoalFixture.milestones.map((m) => ({
        ...m,
        status: 'completed',
      })),
      skillpaths: backendCreateGoalFixture.skillpaths.map((sp) => ({
        ...sp,
        status: 'completed',
      })),
    });
    const result = transformFullRoadmap(allDone);

    expect(result.milestones!.every((m) => m.status === 'completed')).toBe(true);
    expect(
      result.milestones!.every((m) => m.tasks.every((t) => t.status === 'completed'))
    ).toBe(true);
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

describe('formatApiErrorDetail', () => {
  it('formats FastAPI string detail', () => {
    expect(formatApiErrorDetail('Roadmap not found')).toBe('Roadmap not found');
  });

  it('prefers message from structured FastAPI detail', () => {
    expect(
      formatApiErrorDetail({
        message: 'Generate one skillpath per request',
        pending_skillpath_ids: ['sp-1', 'sp-2'],
      })
    ).toBe('Generate one skillpath per request');
  });

  it('stringifies structured detail without a message field', () => {
    expect(formatApiErrorDetail({ pending_skillpath_ids: ['sp-1'] })).toBe(
      '{"pending_skillpath_ids":["sp-1"]}'
    );
  });
});

const articleContent: ArticleLearningContent = {
  content_id: 'c-article-1',
  skillpath_id: 'sp-001',
  title: 'Intro to JSX',
  description: 'Short reading on JSX syntax.',
  content_type: 'article',
  skill_intro: 'JSX lets you write HTML-like syntax in JS.',
  reading_content: '# JSX\nJSX is a syntax extension for JavaScript.',
  references: [{ title: 'React Docs', url: 'https://react.dev' }],
};

const codingContent: CodingProblemLearningContent = {
  content_id: 'c-code-1',
  skillpath_id: 'sp-001',
  title: 'Render a button',
  description: 'Implement a button component.',
  content_type: 'coding_problem',
  prompt: 'Write a Button component that renders its children.',
  difficulty: 'easy',
  starter_code: 'function Button(props) {\n  // TODO\n}',
  expected_output: '<button>Click</button>',
  hints: ['Use props.children'],
};

const quizContent: MultipleChoiceLearningContent = {
  content_id: 'c-quiz-1',
  skillpath_id: 'sp-001',
  title: 'Which hook manages state?',
  description: 'Quick check on React hooks.',
  content_type: 'multiple_choice',
  question: 'Which React hook manages local state?',
  options: [
    { option_id: 'A', text: 'useEffect' },
    { option_id: 'B', text: 'useState' },
  ],
  correct_option_id: 'B',
  explanation: 'useState is React\'s primary state hook.',
};

const learningContents: LearningContentItem[] = [articleContent, codingContent, quizContent];

const roadmapFullWithContentsFixture: RoadmapFull = {
  roadmap_id: 'rm-002',
  title: 'React Path',
  version: 1,
  summary: 'Learn React.',
  target_outcome: 'Ship a SPA',
  assumptions: [],
  milestones: [
    {
      milestone_id: 'ms-001',
      roadmap_id: 'rm-002',
      title: 'Frontend Foundations',
      description: 'React basics',
      objective: 'Confidently build components',
      estimated_hours: 8,
      order_index: 0,
      dependency_titles: [],
      prerequisite_milestone_ids: [],
      status: 'generated',
      need_modification: false,
      skillpaths: [
        {
          roadmap_id: 'rm-002',
          skillpath_id: 'sp-001',
          milestone_id: 'ms-001',
          title: 'JSX & Components',
          description: 'Learn JSX',
          estimated_hours: 3,
          prerequisite_skillpath_ids: [],
          learning_objectives: ['Write JSX'],
          status: 'generated',
          need_generation: false,
          need_modification: false,
          revision_reason: undefined,
          affected_downstream_ids: [],
          practice_mode: 'either',
          learning_contents: learningContents,
        },
      ],
    },
  ],
};

describe('RoadmapFull with learning_contents', () => {
  it('passes learning_contents and practice_mode through transformFullRoadmap to UI task', () => {
    const result = transformFullRoadmap(roadmapFullWithContentsFixture);
    const task = result.milestones![0].tasks[0] as unknown as {
      learning_contents: LearningContentItem[];
      practice_mode: string;
    };

    expect(task.practice_mode).toBe('either');
    expect(task.learning_contents).toHaveLength(3);
    expect(task.learning_contents.map((c) => c.content_type)).toEqual([
      'article',
      'coding_problem',
      'multiple_choice',
    ]);

    const article = task.learning_contents[0] as ArticleLearningContent;
    expect(article.skill_intro).toContain('JSX');
    expect(article.references?.[0].url).toBe('https://react.dev');
  });
});

describe('generate-content API client', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('parses 409 conflict into MultiplePendingSkillpathsError', async () => {
    const conflictBody = {
      detail: {
        message: 'Roadmap has multiple pending skillpaths.',
        pending_skillpath_ids: ['sp-1', 'sp-2'],
        endpoint: '/v1/roadmaps/rm-1/skillpaths/{skillpath_id}/generate-content',
      },
    };
    const makeResponse = () =>
      new Response(JSON.stringify(conflictBody), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    globalThis.fetch = vi.fn().mockImplementation(async () => makeResponse()) as unknown as typeof fetch;

    await expect(generateRoadmapContent('rm-1')).rejects.toBeInstanceOf(MultiplePendingSkillpathsError);

    try {
      await generateRoadmapContent('rm-1');
      throw new Error('expected throw');
    } catch (err) {
      const e = err as MultiplePendingSkillpathsError;
      expect(e.pending_skillpath_ids).toEqual(['sp-1', 'sp-2']);
      expect(e.message).toBe('Roadmap has multiple pending skillpaths.');
    }
  });

  it('passes force=true query when requested for single skillpath', async () => {
    const ok = new Response(
      JSON.stringify({
        roadmap_id: 'rm-1',
        generated_skillpath_count: 1,
        roadmap: roadmapFullWithContentsFixture,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    const spy = vi.fn().mockResolvedValue(ok);
    globalThis.fetch = spy as unknown as typeof fetch;

    await generateSkillpathContent('rm-1', 'sp-001', { force: true });

    expect(spy).toHaveBeenCalledTimes(1);
    const calledUrl = spy.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/v1/roadmaps/rm-1/skillpaths/sp-001/generate-content');
    expect(calledUrl).toContain('force=true');
    expect(calledUrl).toContain('user_id=');
  });
});
