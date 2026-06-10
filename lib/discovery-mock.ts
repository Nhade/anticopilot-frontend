import { DiscoveryResponse } from './api-client';

// Scripted stand-in for the discovery agent. The store falls back to this when
// the backend's /v1/discovery routes are unavailable (PR #13 not merged, or
// backend not running) so the conversation UX stays fully demoable. Turn
// shapes mirror docs/backend-fastapi-agent-and-frontend-api.md and exercise
// every ui_hints type once, plus markdown formatting (the real agent emits
// **bold** and bullet lists).

const SCRIPT: DiscoveryResponse[] = [
  {
    message:
      "Nice — that's a goal we can work with. To make the roadmap concrete: which of these is closest to what you want to build first?",
    ui_hints: {
      type: 'single_choice',
      options: [
        'A dashboard-style web app',
        'A blog or content site',
        'A cross-platform app',
        'An API / backend service',
      ],
    },
    session_complete: false,
    roadmap_job_id: null,
    roadmap_status: null,
  },
  {
    message:
      'Got it. Which of these do you already feel comfortable with? Pick everything that applies so I can skip what you know.',
    ui_hints: {
      type: 'multi_choice',
      options: ['HTML & CSS', 'JavaScript or TypeScript', 'React basics', 'Git & the terminal'],
    },
    session_complete: false,
    roadmap_job_id: null,
    roadmap_status: null,
  },
  {
    message:
      'That helps me calibrate the pace. Roughly how many hours a week can you dedicate, and is there a deadline you care about?',
    ui_hints: { type: 'text_input', options: [] },
    session_complete: false,
    roadmap_job_id: null,
    roadmap_status: null,
  },
  {
    message:
      "Here's what I have:\n- **Goal**: what you described\n- **Current skills**: the ones you picked\n- **Pace**: your weekly hours\n\nReady for me to generate the roadmap?",
    ui_hints: { type: 'confirm', options: ['Yes, generate my roadmap', 'Not yet — let me adjust something'] },
    session_complete: false,
    roadmap_job_id: null,
    roadmap_status: null,
  },
  {
    message:
      "I've saved your goal and started generating your roadmap. This usually takes a few minutes — I'll bring it up as soon as it's ready.",
    ui_hints: null,
    session_complete: true,
    roadmap_job_id: 'mock-roadmap-job',
    roadmap_status: 'running',
  },
];

const MOCK_PREFIX = 'mock-discovery-';
const turnByConversation = new Map<string, number>();

export function createMockDiscoveryConversation(): string {
  const id = `${MOCK_PREFIX}${Date.now()}`;
  turnByConversation.set(id, 0);
  return id;
}

export async function sendMockDiscoveryMessage(conversationId: string): Promise<DiscoveryResponse> {
  const turn = turnByConversation.get(conversationId) ?? 0;
  turnByConversation.set(conversationId, turn + 1);
  // Simulated thinking delay so loading states stay visible during development.
  await new Promise((resolve) => setTimeout(resolve, 900));
  return SCRIPT[Math.min(turn, SCRIPT.length - 1)];
}
