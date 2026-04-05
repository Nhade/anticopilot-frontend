export interface User {
  name: string;
  streak: number;
  level: string;
}

export type MasteryLevel = "beginner" | "intermediate" | "advanced";
export type PacePreference = "slow" | "balanced" | "intensive";
export type ConfidenceLevel = "low" | "medium" | "high";

export interface GoalSpec {
  title: string;
  description: string;
  target_outcome: string;
  deadline: string; // date string
  criteria: string[];
  constraints: string[];
}

export interface LearningProfile {
  baseline_level: MasteryLevel;
  prior_knowledges: string[];
  weak_areas: string[];
  pace_preference: PacePreference;
  confidence_level: ConfidenceLevel;
  needs_recap: boolean;
  prefers_examples_first: boolean;
  overload_risk: ConfidenceLevel;
}

export type SkillPathStatus = "ready" | "generated" | "revising" | "completed" | "revised" | "active" | "upcoming" | "review";

export interface SkillPathItem {
  roadmap_id: string;
  skillpath_id: string;
  milestone_id: string;
  title: string;
  description: string;
  estimated_hours: number;
  prerequisite_skillpath_ids: string[];
  learning_objectives: string[];
  status: SkillPathStatus;
  need_generation: boolean;
  need_modification: boolean;
  revision_reason?: string;
  affected_downstream_ids: string[];
  // Frontend helpers (not in backend entities but useful for UI)
  type?: "learn" | "practice" | "apply" | "optional";
  icon?: string;
}

export type MilestoneStatus = "ready" | "generated" | "revising" | "completed" | "revised" | "active" | "upcoming";

export interface MilestoneItem {
  roadmap_id: string;
  milestone_id: string;
  title: string;
  description: string;
  objective: string;
  estimated_hours: number;
  order_index: number;
  dependency_titles: string[];
  prerequisite_milestone_ids: string[];
  status: MilestoneStatus;
  need_modification: boolean;
  revision_reason?: string;
  // UI consistency with current mock
  skillpaths?: SkillPathItem[];
}

export interface RoadmapItem {
  roadmap_id: string;
  version: number;
  summary: string;
  assumptions: string[];
  target_outcome: string;
  milestones?: MilestoneItem[];
}

// Keep legacy Task/Milestone/Roadmap for backwards compatibility until refactor is complete
export type Task = SkillPathItem & { id: string; subtitle: string; icon: string; status: any };
export interface Milestone extends MilestoneItem {
  id: string;
  icon: string;
  eta: string;
  why: string;
  tasks: Task[];
  subtitle?: string;
  mastery?: "review" | "solid";
  masteryText?: string;
  sideQuest?: {
    title: string;
    type: string;
    description: string;
  };
}

export interface Roadmap extends RoadmapItem { 
  id: string; 
  title: string; 
  status: any;
  description: string;
  stats: { reviewsDue: number; pace: string; lastActive: string };
  milestone: string;
  progress: number;
  linkedProject: string | null;
  icon: string;
  iconColor: string;
  iconBg: string;
  themeStatus: string;
  borderTheme: string;
  bgTheme: string;
  milestones?: Milestone[];
}

export interface ReviewConcept {
  concept_id: string;
  source_type: "struggle_signal" | "skill_path";
  source_ref_id: string;
  concept_metadata: {
    concept_name?: string;
    misconception?: string;
    language?: string;
    description?: string;
    concept?: string; // fallback for older entries
  };
  state: number;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
}

export interface GeneratedTask {
  task_type: string;
  content: string;
  solution: string;
}
