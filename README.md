# AntiCopilot-frontend

This is a frontend project for AntiCopilot, a project-aware adaptive learning roadmap for independent developers. It provides an adaptive roadmap system that tracks your progress, identifies knowledge gaps, and tailors your learning path based on real-world signals from your active projects.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: UI components, including the Roadmap and Dashboard views.
- `lib/`: State management (Zustand), API client, data transforms, mock data, and utility functions.
  - `api-client.ts`: Typed API client — all backend fetch calls are centralized here.
  - `transforms.ts`: Data transforms between backend flat responses and frontend nested structures.
  - `store.ts`: Zustand store — state management and actions (delegates to `api-client` for fetching).
- `hooks/`: Custom React hooks for shared logic.
- `styles/`: Global CSS and design tokens.
- `__tests__/`: Unit tests (Vitest). Currently covers data transform functions.

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Icons**: Lucide React
- **UI Components**: Radix UI

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Testing

```bash
npm test          # Run all tests once
npm run test:watch  # Watch mode
```

Tests use [Vitest](https://vitest.dev/). Test files live in `__tests__/`.
