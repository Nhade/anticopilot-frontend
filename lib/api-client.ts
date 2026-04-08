import { GoalSpec, LearningProfile, RoadmapItem, ReviewConcept, GeneratedTask } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- Roadmap APIs ---

export async function fetchRoadmaps(): Promise<RoadmapItem[]> {
  const response = await fetch(`${API_BASE_URL}/v1/roadmaps`);
  if (!response.ok) throw new Error('Failed to fetch roadmaps');
  return response.json();
}

export interface FullRoadmapResponse {
  roadmap: RoadmapItem;
  milestones: any[];
  skillpaths: any[];
}

export async function fetchRoadmapById(id: string): Promise<FullRoadmapResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/roadmaps/${id}`);
  if (!response.ok) throw new Error('Failed to fetch roadmap');
  return response.json();
}

export interface CreateGoalResponse {
  roadmap_id: string;
  roadmap: RoadmapItem;
  milestones: any[];
  skillpaths: any[];
  status?: 'complete' | 'processing';
}

export async function createGoal(goal: GoalSpec, profile: LearningProfile): Promise<CreateGoalResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal_spec: goal, learning_profile: profile })
  });
  if (!response.ok) throw new Error('Failed to generate roadmap');
  return response.json();
}

// --- Review APIs ---

export async function fetchDueReviews(): Promise<ReviewConcept[]> {
  const response = await fetch(`${API_BASE_URL}/v1/reviews/due`);
  if (!response.ok) throw new Error('Failed to fetch due reviews');
  return response.json();
}

export async function fetchAllReviews(): Promise<ReviewConcept[]> {
  const response = await fetch(`${API_BASE_URL}/v1/reviews/`);
  if (!response.ok) throw new Error('Failed to fetch all reviews');
  return response.json();
}

export async function submitGrade(conceptId: string, grade: 1 | 2 | 3 | 4): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/reviews/${conceptId}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grade })
  });
  if (!response.ok) throw new Error('Failed to submit review grade');
}

export async function generateTask(conceptId: string): Promise<GeneratedTask> {
  const response = await fetch(`${API_BASE_URL}/v1/reviews/${conceptId}/generate-task`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to generate review task');
  return response.json();
}

// --- Async generation support (for future deep agent) ---

export interface RoadmapStatus {
  status: 'processing' | 'complete' | 'error';
  progress?: number;
  roadmap?: FullRoadmapResponse;
  error?: string;
}

export async function pollRoadmapStatus(roadmapId: string): Promise<RoadmapStatus> {
  const response = await fetch(`${API_BASE_URL}/v1/roadmaps/${roadmapId}/status`);
  if (!response.ok) throw new Error('Failed to poll roadmap status');
  return response.json();
}
