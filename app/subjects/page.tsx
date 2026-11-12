"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Circle,
  Plus,
  Search,
  BookOpen,
  Laptop,
  Code2,
  Database,
  Calculator,
  Terminal,
  BarChart3,
  Monitor,
  Layers,
  Calendar,
  Edit3,
  Trash2,
  Sparkles,
  GraduationCap,
  LogIn,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { AddSubjectModal } from "@/components/AddSubjectModal";
import { EditSubjectModal } from "@/components/EditSubjectModal";
import { Subject } from "@/components/MonthlySubjectsCard";
import { authClient } from "@/lib/auth/client";

const CARD_THEMES = [
  {
    bg: "bg-[#F9FCF8]",
    border: "border-emerald-200/90",
    blob: "bg-emerald-100/80",
    badge: "bg-emerald-100/80 text-emerald-950 border border-emerald-300/50",
    ray: "text-emerald-500",
  },
  {
    bg: "bg-[#FFFDF7]",
    border: "border-amber-200/90",
    blob: "bg-amber-100/80",
    badge: "bg-amber-100/80 text-amber-950 border border-amber-300/50",
    ray: "text-amber-500",
  },
  {
    bg: "bg-[#FAF8FC]",
    border: "border-purple-200/90",
    blob: "bg-purple-100/80",
    badge: "bg-purple-100/80 text-purple-950 border border-purple-300/50",
    ray: "text-purple-400",
  },
  {
    bg: "bg-[#F5FBF9]",
    border: "border-teal-200/90",
    blob: "bg-teal-100/80",
    badge: "bg-teal-100/80 text-teal-950 border border-teal-300/50",
    ray: "text-teal-500",
  },
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const session = authClient.useSession();
  const user = session.data?.user;

  const refreshSubjects = useCallback(async () => {
    try {
      const res = await fetch("/api/tracker", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && Array.isArray(data.subjects)) {
          setSubjects(data.subjects);
        } else {
          setSubjects([]);
        }
      }
    } catch (err) {
      console.error("Failed to load subjects:", err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/tracker", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.authenticated && Array.isArray(data.subjects)) {
            setSubjects(data.subjects);
          } else if (!ignore) {
            setSubjects([]);
          }
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const renderIcon = (iconName: string) => {
    const props = { className: "w-5 h-5 text-zinc-900 relative z-10" };
    switch (iconName) {
      case "code":
        return <Code2 {...props} />;
      case "terminal":
        return <Terminal {...props} />;
      case "monitor":
        return <Monitor {...props} />;
      case "layers":
        return <Layers {...props} />;
      case "graph":
      case "chart":
      case "stats":
        return <BarChart3 {...props} />;
      case "database":
        return <Database {...props} />;
      case "math":
        return <Calculator {...props} />;
      case "book":
        return <BookOpen {...props} />;
      default:
        return <Laptop {...props} />;
    }
  };

  // Toggle completion status
  const handleToggleCompleted = async (subject: Subject) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const currentCompleted = Boolean(
      subject.is_completed || subject.completed_lectures >= subject.total_lectures
    );
    const nextCompleted = !currentCompleted;

    setTogglingId(subject.id);

    // Optimistic UI update
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subject.id) {
          return {
            ...s,
            is_completed: nextCompleted,
            completed_lectures: nextCompleted ? s.total_lectures : 0,
          };
        }
        return s;
      })
    );

    if (nextCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    try {
      await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_subject_completed",
          subjectId: subject.id,
          completed: nextCompleted,
        }),
      });
    } catch (err) {
      console.error("Failed to toggle completion:", err);
      refreshSubjects();
    } finally {
      setTogglingId(null);
    }
  };

  // Handle subject details update
  const handleUpdateSubject = async (
    subjectId: string,
    data: {
      title: string;
      teacher: string;
      totalLectures: number;
      completedLectures: number;
    }
  ) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const { title, teacher, totalLectures, completedLectures } = data;
    const isComp = completedLectures >= totalLectures && totalLectures > 0;

    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            title,
            teacher,
            total_lectures: totalLectures,
            completed_lectures: completedLectures,
            is_completed: isComp,
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
          action: "update_subject",
          subjectId,
          title,
          teacher,
          totalLectures,
          completedLectures,
        }),
      });
    } catch (err) {
      console.error("Failed to update subject details:", err);
      refreshSubjects();
    }
  };

  // Handle adding subject
  const handleCreateSubject = async (data: {
    title: string;
    icon: string;
    totalLectures: number;
    completedLectures: number;
    month: string;
    isUrgent: boolean;
    teacher?: string;
  }) => {
    if (!user) {
      setShowAuthModal(true);
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
        await refreshSubjects();
      }
    } catch (err) {
      console.error("Failed to create subject:", err);
    }
  };

  // Delete subject completely
  const handleDeleteSubject = async (subject: Subject) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!confirm(`Delete "${subject.title}" from your GATE syllabus?`)) return;

    setSubjects((prev) => prev.filter((s) => s.id !== subject.id));

    try {
      await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_subject",
          subjectId: subject.id,
        }),
      });
    } catch (err) {
      console.error("Failed to delete subject:", err);
      refreshSubjects();
    }
  };

  // Computed stats
  const stats = useMemo(() => {
    const totalSubjects = subjects.length;
    const completedSubjects = subjects.filter(
      (s) => s.is_completed || s.completed_lectures >= s.total_lectures
    ).length;
    const totalLectures = subjects.reduce((acc, curr) => acc + curr.total_lectures, 0);
    const completedLectures = subjects.reduce((acc, curr) => acc + curr.completed_lectures, 0);
    const percent =
      totalSubjects > 0 ? Math.round((completedSubjects / totalSubjects) * 100) : 0;
    const lecturePercent =
      totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

    return {
      totalSubjects,
      completedSubjects,
      remainingSubjects: Math.max(0, totalSubjects - completedSubjects),
      totalLectures,
      completedLectures,
      percent,
      lecturePercent,
    };
  }, [subjects]);

  // Filtered list
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const isComp = Boolean(s.is_completed || s.completed_lectures >= s.total_lectures);
      if (filterTab === "active" && isComp) return false;
      if (filterTab === "completed" && !isComp) return false;

      if (searchQuery.trim()) {
        return s.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
      }
      return true;
    });
  }, [subjects, filterTab, searchQuery]);

  return (
    <div className="min-h-screen pb-16 px-3 sm:px-6">
      <Header />

      <main className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-full border-2 border-zinc-800 bg-white hover:bg-emerald-50 flex items-center justify-center text-zinc-800 shadow-xs transition-transform active:scale-90 cursor-pointer"
              title="Back to monthly dashboard"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 font-display flex items-center gap-2">
                <span>GATE Subjects & Syllabus</span>
                <span className="text-emerald-500 font-hand text-xl">彡</span>
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                Track all your GATE exam subjects in one place and monitor full syllabus completion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                  return;
                }
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-full bg-emerald-400 border-2 border-zinc-900 font-bold text-xs sm:text-sm text-zinc-950 shadow-[2px_2px_0px_rgba(0,0,0,0.15)] hover:bg-emerald-300 active:translate-y-0.5 flex items-center gap-1.5 transition-all cursor-pointer font-display"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>

        {/* Not Logged In Notice */}
        {!user && (
          <div className="p-4 rounded-3xl border-2 border-amber-300 bg-amber-50/80 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-amber-950 font-display">
                  Sign in to save your GATE subjects
                </p>
                <p className="text-[11px] sm:text-xs text-amber-800">
                  Your subjects and completion status are securely synced with Neon Postgres when logged in.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3.5 py-1.5 rounded-full bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-3xl border-2 border-zinc-900 bg-white p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.1)] flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-display">
              Subjects Completed
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-display">
                {stats.completedSubjects}
              </span>
              <span className="text-xs font-bold text-zinc-500 font-display">
                / {stats.totalSubjects}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden mt-3">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border-2 border-zinc-900 bg-white p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.1)] flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-display">
              Syllabus Progress
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-zinc-900 font-display">
                {stats.percent}%
              </span>
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 mt-2">
              {stats.remainingSubjects} subjects remaining
            </span>
          </div>

          <div className="rounded-3xl border-2 border-zinc-900 bg-white p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.1)] flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-display">
              Total Lectures
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 font-display">
                {stats.completedLectures}
              </span>
              <span className="text-xs font-bold text-zinc-500 font-display">
                / {stats.totalLectures}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden mt-3">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.lecturePercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border-2 border-zinc-900 bg-[#FAF9F5] p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.1)] flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-display">
              Exam Target
            </span>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-zinc-900 font-display">
                GATE 2027
              </span>
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 mt-2">
              Master one subject at a time
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center p-1 rounded-full border-2 border-zinc-800 bg-white shadow-2xs w-fit">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer font-display ${
                filterTab === "all"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              All ({subjects.length})
            </button>
            <button
              onClick={() => setFilterTab("active")}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer font-display ${
                filterTab === "active"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              In Progress ({stats.remainingSubjects})
            </button>
            <button
              onClick={() => setFilterTab("completed")}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer font-display ${
                filterTab === "completed"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Completed ({stats.completedSubjects})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-full border-2 border-zinc-800 bg-white text-xs font-semibold text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 placeholder:text-zinc-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Subjects List Grid */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center text-zinc-500 font-bold text-sm">
              <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
              <p>Loading your GATE subjects...</p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="py-16 px-4 text-center rounded-3xl border-2 border-dashed border-zinc-300 bg-white">
              <div className="text-3xl mb-2">📚</div>
              <h4 className="font-bold text-base text-zinc-900 font-display mb-1">
                {searchQuery ? "No subjects match your search" : "No subjects in this view"}
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? "Try checking for spelling mistakes or clear your search filter."
                  : "Add your GATE syllabus subjects to keep track of lectures and overall readiness."}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-full bg-emerald-400 border-2 border-zinc-900 font-bold text-xs text-zinc-900 hover:bg-emerald-300 transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add a Subject</span>
              </button>
            </div>
          ) : (
            filteredSubjects.map((subject, index) => {
              const isCompleted = Boolean(
                subject.is_completed || subject.completed_lectures >= subject.total_lectures
              );
              const percent =
                subject.total_lectures > 0
                  ? Math.round((subject.completed_lectures / subject.total_lectures) * 100)
                  : 0;
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const isToggling = togglingId === subject.id;

              return (
                <motion.div
                  key={subject.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setEditingSubject(subject)}
                  className={`rounded-3xl border-2 p-4 sm:p-5 shadow-xs transition-all flex flex-col gap-3.5 cursor-pointer hover:border-zinc-400 ${
                    isCompleted
                      ? "bg-[#F3FAF4] border-emerald-400 shadow-[2px_2px_0px_rgba(16,185,129,0.2)]"
                      : `${theme.bg} ${theme.border}`
                  }`}
                >
                  {/* Top Row: Icon + Title + Status Button */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Icon & Subject Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                        {/* Radiating Rays */}
                        <svg
                          className={`absolute -inset-1 w-13 h-13 pointer-events-none ${
                            isCompleted ? "text-emerald-500" : theme.ray
                          }`}
                          viewBox="0 0 52 52"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M12 12 L6 6" />
                          <path d="M26 8 L26 2" />
                          <path d="M40 12 L46 6" />
                        </svg>

                        {/* Soft Blob */}
                        <div
                          className={`absolute inset-0.5 rounded-[45%_55%_65%_35%/50%_60%_40%_50%] ${
                            isCompleted ? "bg-emerald-200/80" : theme.blob
                          }`}
                        />

                        {renderIcon(subject.icon)}
                      </div>

                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base sm:text-lg text-zinc-950 font-display truncate">
                            {subject.title}
                          </h4>
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300/80 shrink-0">
                              Completed
                            </span>
                          )}
                        </div>

                        {/* Teacher name if assigned */}
                        {subject.teacher && (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-600">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[200px]">{subject.teacher}</span>
                          </div>
                        )}

                        {/* Scheduled Months Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-600">
                          {subject.monthly_plans && subject.monthly_plans.length > 0 ? (
                            subject.monthly_plans.map((p) => (
                              <span
                                key={p.month}
                                className="px-2 py-0.5 rounded-full bg-white border border-zinc-300 text-zinc-700 font-semibold inline-flex items-center gap-1"
                              >
                                <Calendar className="w-2.5 h-2.5 text-zinc-500" />
                                <span>{p.month}</span>
                                {p.is_urgent && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                )}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-400 italic">Not scheduled in any month yet</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCompleted(subject);
                        }}
                        disabled={isToggling}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer font-display ${
                          isCompleted
                            ? "bg-emerald-500 text-white border-zinc-900 hover:bg-emerald-600"
                            : "bg-white text-zinc-800 border-zinc-800 hover:bg-emerald-50 hover:text-emerald-950"
                        }`}
                        title={
                          isCompleted
                            ? "Click to mark as not completed"
                            : "Click to mark subject as 100% completed"
                        }
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5]" />
                            <span>Mark Completed</span>
                          </>
                        )}
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(subject);
                        }}
                        className="w-8 h-8 rounded-full border border-zinc-200 hover:border-rose-300 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete subject from syllabus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-zinc-200/90 overflow-hidden p-0.5">
                    <motion.div
                      className={`h-full rounded-full ${
                        isCompleted ? "bg-emerald-600" : "bg-emerald-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, percent)}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>

                  {/* Bottom Stats & Edit Link */}
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 font-display pt-0.5">
                    <div
                      className="flex items-center gap-1.5 group text-zinc-700 hover:text-zinc-950"
                    >
                      <span>
                        {subject.completed_lectures} / {subject.total_lectures} lectures completed
                      </span>
                      <Edit3 className="w-3 h-3 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-md font-black text-xs ${
                        isCompleted
                          ? "bg-emerald-200/90 text-emerald-950 border border-emerald-400/60"
                          : theme.badge
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      {/* Add Subject Modal (allows empty month) */}
      <AddSubjectModal
        isOpen={isAddModalOpen}
        initialMonth=""
        allowNoMonth={true}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={handleCreateSubject}
      />

      {/* Edit Subject Details Modal */}
      <EditSubjectModal
        isOpen={Boolean(editingSubject)}
        subject={editingSubject}
        onClose={() => setEditingSubject(null)}
        onSave={handleUpdateSubject}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={refreshSubjects}
      />
    </div>
  );
}
