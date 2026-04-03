"use client";

import React, { useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Code2,
  Map,
  Compass,
  LayoutDashboard,
  BrainCircuit,
  Settings,
  Bell,
  ChevronRight,
  Sun,
  Moon,
  Target,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { NavItem } from "@/components/nav-item";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { DashboardView } from "@/components/dashboard-view";
import { ManageRoadmapsView } from "@/components/roadmap/manage-roadmaps-view";
import { RoadmapSwitcher } from "@/components/roadmap/roadmap-switcher";
import { TaskDetailSheet } from "@/components/task-detail-sheet";
import { useStore } from "@/lib/store";

export default function DashboardPage() {
  const {
    activeTab,
    setActiveTab,
    setSelectedTaskId,
    getActiveRoadmap,
    user
  } = useStore();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [shouldScrollToMilestone, setShouldScrollToMilestone] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeRoadmap = getActiveRoadmap();

  // Scroll to active milestone when the breadcrumb is clicked
  useEffect(() => {
    if (activeTab === "roadmap" && shouldScrollToMilestone) {
      const activeMilestoneId = activeRoadmap?.milestones?.find((m) => m.status === "active")?.id;
      const element = document.getElementById(activeMilestoneId || "");

      if (element && contentRef.current) {
        const container = contentRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Calculate position relative to container
        const relativeTop = elementRect.top - containerRect.top;
        const targetScrollTop = relativeTop + container.scrollTop - 68; // "NOW" label has 20px height + two 24px margin

        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth"
        });
      }
      setShouldScrollToMilestone(false);
    }
  }, [activeTab, shouldScrollToMilestone, activeRoadmap]);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 overflow-hidden font-sans selection:bg-active/30 transition-colors duration-300">
      {/* Background ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-active/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#36685c]/10 blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl hidden md:flex flex-col justify-between relative z-10 transition-colors duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-active to-[#005c6b] flex items-center justify-center shadow-lg shadow-active/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600 dark:from-zinc-100 dark:to-zinc-400">
              AntiCopilot
            </span>
          </div>

          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
            <NavItem icon={<Map size={18} />} label="Roadmap" active={activeTab === "roadmap"} onClick={() => setActiveTab("roadmap")} />
            <NavItem icon={<Code2 size={18} />} label="Projects" active={activeTab === "projects"} onClick={() => setActiveTab("projects")} />
            <NavItem icon={<Compass size={18} />} label="Explore Skill" active={activeTab === "explore"} onClick={() => setActiveTab("explore")} />
          </nav>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl relative group overflow-hidden bg-linear-to-b from-slate-100 to-white dark:from-zinc-800/40 dark:to-zinc-900/40 border border-slate-200 dark:border-zinc-700/50 shadow-sm dark:shadow-inner">
            <div className="absolute inset-0 bg-linear-to-tr from-active/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <Flame className="w-5 h-5 text-review" />
              <div className="text-sm font-medium">{user.streak} Day Streak!</div>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 relative z-10">You're in the top 5% of consistent learners this week.</p>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-slate-200 dark:border-zinc-700">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 truncate">{user.name}</p>
              <p className="text-xs text-slate-500/60 truncate">{user.level}</p>
            </div>
            <Settings className="w-4 h-4 text-slate-500/60 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-slate-200 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
          <RoadmapSwitcher />

          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative text-slate-500/60 hover:text-slate-900 dark:hover:text-zinc-100 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-active rounded-full border border-white dark:border-zinc-950" />
            </Button>
          </div>
        </header>

        {/* Compact Progress Rail */}
        <div className="px-8 bg-slate-50/60 dark:bg-zinc-900/40 border-b border-slate-200/50 dark:border-zinc-800/30 flex items-center shadow-xs sticky top-20 z-10 backdrop-blur-md overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center text-[11px] font-medium h-10 w-full">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300 transition-colors cursor-pointer shrink-0" onClick={() => setActiveTab("roadmap")}>
              <Map size={12} />
              {activeRoadmap?.title}
            </div>
            <ChevronRight size={12} className="mx-2 text-slate-300 dark:text-zinc-700 shrink-0" />
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300 transition-colors cursor-pointer shrink-0" onClick={() => { setActiveTab("roadmap"); setShouldScrollToMilestone(true); }}>
              <Target size={12} />
              {activeRoadmap?.milestone}
            </div>
            <ChevronRight size={12} className="mx-2 text-slate-300 dark:text-zinc-700 shrink-0" />
            <div
              className="flex items-center gap-1.5 text-active font-semibold shrink-0 cursor-pointer hover:underline underline-offset-4"
              onClick={() => setSelectedTaskId("Secure Token Storage")}
            >
              <Code2 size={12} />
              Secure Token Storage
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-8 py-10 pb-12 scroll-smooth">
          {activeTab === "roadmap" && <RoadmapView />}
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "manage-roadmaps" && <ManageRoadmapsView />}
          {!["roadmap", "dashboard", "manage-roadmaps"].includes(activeTab) && <DashboardView />}
        </div>
      </main>

      {/* Task Detail Sheet */}
      <TaskDetailSheet />
    </div>
  );
}
