import { GoalSpec, LearningProfile, RoadmapItem, ReviewConcept, GeneratedTask, SkillPathItem, MilestoneItem } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
export const API_USER_ID = process.env.NEXT_PUBLIC_ANTICOPILOT_USER_ID || 'default-user';

function withUserId(path: string): string {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}user_id=${encodeURIComponent(API_USER_ID)}`;
}

export function formatApiErrorDetail(detail: unknown): string {
  if (typeof detail === 'string') {
    return detail;
  }
  if (detail && typeof detail === 'object') {
    if ('message' in detail && typeof detail.message === 'string') {
      return detail.message;
    }
    return JSON.stringify(detail);
  }
  return '';
}

async function apiError(response: Response, fallback: string): Promise<Error> {
  let detail = '';
  try {
    const body = await response.json();
    detail = formatApiErrorDetail(body?.detail);
  } catch {
    try {
      detail = await response.text();
    } catch {
      detail = '';
    }
  }

  const suffix = detail ? `: ${detail}` : '';
  return new Error(`${fallback}${suffix}`);
}

async function expectOk(response: Response, fallback: string): Promise<void> {
  if (!response.ok) {
    throw await apiError(response, fallback);
  }
}

// --- Roadmap APIs ---

export async function fetchRoadmaps(): Promise<RoadmapItem[]> {
  const response = await fetch(`${API_BASE_URL}${withUserId('/v1/roadmaps')}`);
  await expectOk(response, 'Failed to fetch roadmaps');
  return response.json();
}

export interface FlatRoadmapResponse {
  roadmap: RoadmapItem;
  milestones: MilestoneItem[];
  skillpaths: SkillPathItem[];
}

export interface MilestoneWithSkillPaths extends MilestoneItem {
  skillpaths?: SkillPathItem[];
}

export interface RoadmapFull extends RoadmapItem {
  milestones: MilestoneWithSkillPaths[];
}

export async function fetchRoadmapById(id: string): Promise<RoadmapFull> {
  const response = await fetch(`${API_BASE_URL}${withUserId(`/v1/roadmaps/${encodeURIComponent(id)}`)}`);
  await expectOk(response, 'Failed to fetch roadmap');
  return response.json();
}

export interface CreateGoalResponse extends FlatRoadmapResponse {
  roadmap_id: string;
  status?: 'complete' | 'processing';
}

export async function createGoal(goal: GoalSpec, profile: LearningProfile): Promise<CreateGoalResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal_spec: goal, learning_profile: profile, user_id: API_USER_ID })
  });
  await expectOk(response, 'Failed to generate roadmap');
  return response.json();
}

// --- Review APIs ---

export async function fetchDueReviews(): Promise<ReviewConcept[]> {
  const response = await fetch(`${API_BASE_URL}${withUserId('/v1/reviews/due')}`);
  await expectOk(response, 'Failed to fetch due reviews');
  return response.json();
}

export async function fetchAllReviews(): Promise<ReviewConcept[]> {
  const response = await fetch(`${API_BASE_URL}${withUserId('/v1/reviews/')}`);
  await expectOk(response, 'Failed to fetch all reviews');
  return response.json();
}

export async function submitGrade(conceptId: string, grade: 1 | 2 | 3 | 4): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${withUserId(`/v1/reviews/${encodeURIComponent(conceptId)}/grade`)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grade })
  });
  await expectOk(response, 'Failed to submit review grade');
}

export async function generateTask(conceptId: string): Promise<GeneratedTask> {
  const response = await fetch(`${API_BASE_URL}${withUserId(`/v1/reviews/${encodeURIComponent(conceptId)}/generate-task`)}`, {
    method: 'POST'
  });
  await expectOk(response, 'Failed to generate review task');
  return response.json();
}

// --- Content generation APIs ---

export interface GenerateContentResponse {
  roadmap_id: string;
  generated_skillpath_count: number;
  roadmap: RoadmapFull;
}

export interface GenerateContentConflict {
  message: string;
  pending_skillpath_ids: string[];
  endpoint: string;
}

export class MultiplePendingSkillpathsError extends Error {
  pending_skillpath_ids: string[];
  endpoint: string;

  constructor(detail: GenerateContentConflict) {
    super(detail.message);
    this.name = 'MultiplePendingSkillpathsError';
    this.pending_skillpath_ids = detail.pending_skillpath_ids;
    this.endpoint = detail.endpoint;
  }
}

function isConflictDetail(value: unknown): value is GenerateContentConflict {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as GenerateContentConflict).pending_skillpath_ids)
  );
}

export async function generateRoadmapContent(roadmapId: string): Promise<GenerateContentResponse> {
  const response = await fetch(
    `${API_BASE_URL}${withUserId(`/v1/roadmaps/${encodeURIComponent(roadmapId)}/generate-content`)}`,
    { method: 'POST' }
  );
  if (response.status === 409) {
    let detailBody: unknown = undefined;
    try {
      const body = await response.json();
      detailBody = body?.detail;
    } catch {
      // ignore — fall through to generic error
    }
    if (isConflictDetail(detailBody)) {
      throw new MultiplePendingSkillpathsError(detailBody);
    }
  }
  await expectOk(response, 'Failed to generate roadmap content');
  return response.json();
}

export async function generateSkillpathContent(
  roadmapId: string,
  skillpathId: string,
  options: { force?: boolean } = {}
): Promise<GenerateContentResponse> {
  const params = new URLSearchParams();
  if (options.force) {
    params.set('force', 'true');
  }
  const query = params.toString();
  const path = `/v1/roadmaps/${encodeURIComponent(roadmapId)}/skillpaths/${encodeURIComponent(skillpathId)}/generate-content${query ? `?${query}` : ''}`;
  const response = await fetch(`${API_BASE_URL}${withUserId(path)}`, { method: 'POST' });
  await expectOk(response, 'Failed to generate skillpath content');
  return response.json();
}

// --- Skillpath status ---

export type SkillpathBackendStatus =
  | 'ready'
  | 'generated'
  | 'revising'
  | 'completed'
  | 'revised';

export async function updateSkillpathStatus(
  roadmapId: string,
  skillpathId: string,
  status: SkillpathBackendStatus
): Promise<RoadmapFull> {
  const path = `/v1/roadmaps/${encodeURIComponent(roadmapId)}/skillpaths/${encodeURIComponent(skillpathId)}/status`;
  const response = await fetch(`${API_BASE_URL}${withUserId(path)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  await expectOk(response, 'Failed to update skillpath status');
  return response.json();
}
