"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Header } from "./Header";
import { RoadToGate, MONTHS } from "./RoadToGate";
import { MonthlyProgressCard } from "./MonthlyProgressCard";
import { MonthlySubjectsCard, Subject } from "./MonthlySubjectsCard";
import { AddSubjectModal } from "./AddSubjectModal";
import { AuthModal } from "./AuthModal";
import { authClient } from "@/lib/auth/client";

interface GateTrackerAppProps {
  initialSubjects: Subject[];
}

export function GateTrackerApp({ initialSubjects }: GateTrackerAppProps) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-11");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);

  const session = authClient.useSession();
  const isAuthenticated = Boolean(session.data?.user);

  // Sync latest data from Neon Postgres API
  const refreshData = useCallback(async () => {
    try {
      const res = await fetch("/api/tracker");
      if (res.ok) {
        const json = await res.json();
        if (json.subjects) {
          setSubjects(json.subjects);
        } else {
          setSubjects([]);
        }
      }
    } catch (err) {
      console.error("Failed to refresh tracker data from database:", err);
    }
  }, []);

  // Helper to intercept unauthenticated actions and prompt for login
  const requireAuth = (notice: string = "Please sign in to manage your GATE preparation."): boolean => {
    if (!isAuthenticated) {
      setAuthPromptMessage(notice);
      setAuthModalMode("signin");
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  const handleOpenAddModal = () => {
    if (!requireAuth("Please sign in or create an account to start adding your GATE subjects.")) {
      return;
    }
    setIsAddModalOpen(true);
  };

  // Selected month metadata
  const currentMonthInfo = useMemo(() => {
    return MONTHS.find((m) => m.id === selectedMonth) || MONTHS[1];
  }, [selectedMonth]);

  // Subjects assigned to the selected month
  const monthSubjects = useMemo(() => {
    return subjects.filter((s) => s.monthly_plans.some((p) => p.month === selectedMonth));
  }, [subjects, selectedMonth]);

  // Calculate stats for all months (for the Road to GATE milestones) - strictly from database records
  const monthlyStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; percent: number; planned: boolean }> = {};

    MONTHS.forEach((m) => {
      const subs = subjects.filter((s) => s.monthly_plans.some((p) => p.month === m.id));
      if (subs.length === 0) {
        stats[m.id] = { total: 0, completed: 0, percent: 0, planned: false };
      } else {
        const total = subs.reduce((acc, curr) => acc + curr.total_lectures, 0);
        const completed = subs.reduce((acc, curr) => acc + curr.completed_lectures, 0);
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        stats[m.id] = { total, completed, percent, planned: true };
      }
    });

    return stats;
  }, [subjects]);

  // Calculate stats specifically for the selected month's cards - strictly from database records
  const selectedStats = useMemo(() => {
    const total = monthSubjects.reduce((acc, curr) => acc + curr.total_lectures, 0);
    const completed = monthSubjects.reduce((acc, curr) => acc + curr.completed_lectures, 0);

    // Urgent subjects in this month
    const urgentSubs = monthSubjects.filter((s) => {
      const plan = s.monthly_plans.find((p) => p.month === selectedMonth);
      return plan?.is_urgent;
    });

    const urgentRemaining = urgentSubs.reduce((acc, curr) => {
      const rem = Math.max(0, curr.total_lectures - curr.completed_lectures);
      return acc + rem;
    }, 0);

    // Dynamic days remaining based on month
    let daysRemaining = 30;
    if (selectedMonth === "2026-10") {
      daysRemaining = 0; // October has already passed
    } else if (selectedMonth === "2026-11") {
      daysRemaining = 10;
    } else if (selectedMonth === "2026-12") {
      daysRemaining = 31;
    } else if (selectedMonth === "2027-01") {
      daysRemaining = 31;
    } else if (selectedMonth === "2027-02") {
      daysRemaining = 7; // Cutoff first week of Feb
    }

    return {
      total,
      completed,
      urgentRemaining,
      daysRemaining,
    };
  }, [selectedMonth, monthSubjects]);

  // Handlers guarded with requireAuth
  const handleLogLecture = async (subjectId: string, delta: number) => {
    if (!requireAuth("Please sign in or create an account to log completed lectures.")) {
      return;
    }

    // Optimistic UI update
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjectId) {
          const nextVal = Math.max(0, Math.min(s.total_lectures, s.completed_lectures + delta));
          return { ...s, completed_lectures: nextVal };
        }
        return s;
      })
    );

    try {
      await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log_lecture",
          subjectId,
          delta,
        }),
      });
    } catch (err) {
      console.error("Failed to log lecture:", err);
      refreshData();
    }
  };

  const handleToggleUrgent = async (
    subjectId: string,
    month: string,
    currentUrgent: boolean
  ) => {
    if (!requireAuth("Please sign in or create an account to update urgent subject plans.")) {
      return;
    }

    const nextUrgent = !currentUrgent;

    // Optimistic UI update
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            monthly_plans: s.monthly_plans.map((p) =>
              p.month === month ? { ...p, is_urgent: nextUrgent } : p
            ),
          };
        }
        return s;
      })
    );

    try {
      await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_urgent",
          subjectId,
          month,
          isUrgent: nextUrgent,
        }),
      });
    } catch (err) {
      console.error("Failed to toggle urgent:", err);
      refreshData();
    }
  };

  const handleCreateSubject = async (data: {
    title: string;
    icon: string;
    totalLectures: number;
    completedLectures: number;
    month: string;
    isUrgent: boolean;
  }) => {
    if (!requireAuth("Please sign in or create an account to add subjects to your GATE plan.")) {
      return;
    }

    try {
      const res = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_subject",
          ...data,
        }),
      });

      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error("Failed to create subject:", err);
    }
  };

  const handleRemoveFromMonth = async (subjectId: string, month: string) => {
    if (!requireAuth("Please sign in or create an account to modify monthly plans.")) {
      return;
    }

    // Optimistic UI update
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            monthly_plans: s.monthly_plans.filter((p) => p.month !== month),
          };
        }
        return s;
      })
    );

    try {
      await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_from_month",
          subjectId,
          month,
        }),
      });
    } catch (err) {
      console.error("Failed to remove from month:", err);
      refreshData();
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!requireAuth("Please sign in or create an account to delete subjects.")) {
      return;
    }

    // Optimistic UI update
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));

    try {
      await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_subject",
          subjectId,
        }),
      });
    } catch (err) {
      console.error("Failed to delete subject:", err);
      refreshData();
    }
  };

  const handleAddExistingToMonth = async (subjectId: string, month: string) => {
    if (!requireAuth("Please sign in or create an account to carry over subjects.")) {
      return;
    }

    // Optimistic UI update
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjectId) {
          const plans = [...s.monthly_plans];
          if (!plans.some((p) => p.month === month)) {
            plans.push({ month, is_urgent: false });
          }
          return { ...s, monthly_plans: plans };
        }
        return s;
      })
    );

    try {
      await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_to_month",
          subjectId,
          month,
          isUrgent: false,
        }),
      });
    } catch (err) {
      console.error("Failed to add existing subject to month:", err);
      refreshData();
    }
  };

  return (
    <div className="min-h-screen pb-16 px-3 sm:px-6">
      {/* Top Header */}
      <Header
        currentDateText="Nov 18, 2026"
        onOpenAuthModal={(mode = "signin") => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onRefreshData={refreshData}
      />

      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Road to GATE 2027 Milestone Banner */}
        <RoadToGate
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          monthlyStats={monthlyStats}
        />

        {/* Lower Two Cards Grid (Matches Mockup Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Progress & Plan (4.5 cols) */}
          <div className="lg:col-span-5 flex">
            <MonthlyProgressCard
              monthName={currentMonthInfo.name}
              monthId={selectedMonth}
              totalLectures={selectedStats.total}
              completedLectures={selectedStats.completed}
              urgentRemaining={selectedStats.urgentRemaining}
              daysRemaining={selectedStats.daysRemaining}
            />
          </div>

          {/* Right Column: Month Subjects (7.5 cols) */}
          <div className="lg:col-span-7 flex">
            <MonthlySubjectsCard
              monthName={currentMonthInfo.name}
              monthId={selectedMonth}
              subjects={monthSubjects}
              allSubjects={subjects}
              onOpenAddModal={handleOpenAddModal}
              onLogLecture={handleLogLecture}
              onToggleUrgent={handleToggleUrgent}
              onRemoveFromMonth={handleRemoveFromMonth}
              onDeleteSubject={handleDeleteSubject}
              onAddExistingToMonth={handleAddExistingToMonth}
            />
          </div>
        </div>
      </main>

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={isAddModalOpen}
        initialMonth={selectedMonth}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={handleCreateSubject}
      />

      {/* Neon Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        promptMessage={authPromptMessage}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthPromptMessage(null);
        }}
        onSuccess={refreshData}
      />
    </div>
  );
}
