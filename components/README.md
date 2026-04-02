# Components Directory

This directory contains the modular UI components for the AntiCopilot project. The codebase has been refactored from a monolithic `page.tsx` into a structured, component-based architecture for better maintainability and scalability.

## Directory Structure

```text
components/
├── ui/                     # Shadcn UI (Radix-based) base components
├── roadmap/                # Roadmap-specific features and views
│   ├── adaptation-item.tsx     # Reason/adaptation logic displays
│   ├── context-card.tsx        # Top-level context indicators (Goal, Time)
│   ├── expandable-milestone.tsx# Detailed milestone view with tasks
│   ├── manage-roadmaps-view.tsx# Full view for switching and editing roadmaps
│   ├── roadmap-task-item.tsx   # Individual tasks within a roadmap module
│   └── roadmap-view.tsx        # Main orchestration for the Roadmap tab
├── dashboard-view.tsx      # Main orchestration for the Dashboard tab
├── nav-item.tsx            # Sidebar navigation link component
├── task-item.tsx           # Generic task item used in Dashboard and Sheets
├── icons.tsx               # Small SVG icons and specific task indicators
└── theme-provider.tsx      # Next-themes wrapper for dark mode support
```

## Component Details

### Shared Components
- **NavItem**: A responsive sidebar link with active state highlighting.
- **TaskItem**: A versatile checkbox-style item supporting completed, active (pulsing), and upcoming states.
- **icons.tsx**: Houses `ClockIcon` and `RoadmapNode` utility components.

### Feature Views
- **DashboardView**: The landing view for users, highlighting immediate blockers (e.g., Review Blocker) and current project progress.
- **RoadmapView**: Displays the "Adaptive Path," including review queues, path updates, and expandable milestones.
- **ManageRoadmapsView**: Provides a high-level management interface for all active and paused roadmaps, including settings dialogs.

### Roadmap-Specific Components
- **ExpandableMilestone**: A complex component that manages local expanded/collapsed state, AI-driven task adjustment simulated logic, and detailed task breakdowns.
- **RoadmapTaskItem**: Tailored task display for roadmap modules, supporting different activity types (Learn, Practice, Apply).

## Usage Note
Most components are functional and stateless where possible, receiving their data through props. High-level state (like the active tab and selected tasks for the detail sheet) remains in `app/page.tsx` for cross-component orchestration.
