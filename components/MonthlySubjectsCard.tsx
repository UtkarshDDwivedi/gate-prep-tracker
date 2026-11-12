"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Plus,
  Minus,
  Bell,
  Laptop,
  Code2,
  Database,
  Calculator,
  BookOpen,
  Terminal,
  BarChart3,
  Monitor,
  MoreVertical,
  Trash2,
  CalendarPlus,
  CheckCircle2,
  Edit3,
  GraduationCap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { EditSubjectModal, UpdateSubjectPayload } from "./EditSubjectModal";

export interface Subject {
  id: string;
  title: string;
  icon: string;
  total_lectures: number;
  completed_lectures: number;
  teacher?: string;
  is_completed?: boolean;
  monthly_plans: Array<{
    month: string;
    is_urgent: boolean;
  }>;
}

const CARD_THEMES = [
  {
    bg: "bg-[#F9FCF8]",
    border: "border-emerald-200/90",
    blob: "bg-emerald-100/80",
    ray: "text-emerald-500",
    badge: "bg-emerald-100/70 text-emerald-950 border border-emerald-300/50",
    pillNum: "bg-emerald-100",
  },
  {
    bg: "bg-[#FFFDF7]",
    border: "border-amber-200/90",
    blob: "bg-amber-100/80",
    ray: "text-amber-500",
    badge: "bg-amber-100/70 text-amber-950 border border-amber-300/50",
    pillNum: "bg-amber-100",
  },
  {
    bg: "bg-[#FAF8FC]",
    border: "border-purple-200/90",
    blob: "bg-purple-100/80",
    ray: "text-purple-400",
    badge: "bg-purple-100/70 text-purple-950 border border-purple-300/50",
    pillNum: "bg-purple-100",
  },
  {
    bg: "bg-[#F5FBF9]",
    border: "border-teal-200/90",
    blob: "bg-teal-100/80",
    ray: "text-teal-500",
    badge: "bg-teal-100/70 text-teal-950 border border-teal-300/50",
    pillNum: "bg-teal-100",
  },
];

interface MonthlySubjectsCardProps {
  monthName: string;
  monthId: string; // e.g. "2026-11"
  subjects: Subject[];
  allSubjects: Subject[];
  onOpenAddModal: () => void;
  onLogLecture: (subjectId: string, delta: number) => Promise<void>;
  onToggleUrgent: (subjectId: string, month: string, currentUrgent: boolean) => Promise<void>;
  onRemoveFromMonth: (subjectId: string, month: string) => Promise<void>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onAddExistingToMonth: (subjectId: string, month: string) => Promise<void>;
  onUpdateSubject?: (subjectId: string, data: UpdateSubjectPayload) => Promise<void>;
  onUpdateSubjectTotal?: (subjectId: string, newTotal: number) => Promise<void>;
}

export function MonthlySubjectsCard({
  monthName,
  monthId,
  subjects,
  allSubjects,
  onOpenAddModal,
  onLogLecture,
  onToggleUrgent,
  onRemoveFromMonth,
  onDeleteSubject,
  onAddExistingToMonth,
  onUpdateSubject,
  onUpdateSubjectTotal,
}: MonthlySubjectsCardProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showExistingDropdown, setShowExistingDropdown] = useState(false);
  const [loadingSubjectId, setLoadingSubjectId] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    if (!activeMenuId && !showExistingDropdown) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (activeMenuId && !target.closest(`[data-subject-menu="${activeMenuId}"]`)) {
        setActiveMenuId(null);
      }
      if (showExistingDropdown && !target.closest("[data-existing-dropdown]")) {
        setShowExistingDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenuId(null);
        setShowExistingDropdown(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenuId, showExistingDropdown]);

  // Helper for subject icons
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

  const handleIncrement = async (subject: Subject) => {
    if (subject.completed_lectures >= subject.total_lectures) return;
    setLoadingSubjectId(subject.id);
    try {
      await onLogLecture(subject.id, 1);
      if (subject.completed_lectures + 1 === subject.total_lectures) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } finally {
      setLoadingSubjectId(null);
    }
  };

  const handleDecrement = async (subject: Subject) => {
    if (subject.completed_lectures <= 0) return;
    setLoadingSubjectId(subject.id);
    try {
      await onLogLecture(subject.id, -1);
    } finally {
      setLoadingSubjectId(null);
    }
  };

  // Subjects not yet added to this month
  const availableExisting = allSubjects.filter(
    (s) => !s.monthly_plans.some((p) => p.month === monthId)
  );

  return (
    <div className="relative w-full rounded-3xl bg-[#FCFAF6] border-2 border-zinc-800/80 p-3.5 sm:p-7 shadow-[3px_4px_0px_rgba(0,0,0,0.08)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3.5 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border-2 border-zinc-800 flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4 text-emerald-800" />
            </div>
            <h3 className="font-extrabold text-base sm:text-2xl text-zinc-900 font-display flex items-center gap-1">
              <span>{monthName} · Subjects</span>
              <span className="text-emerald-500 font-hand text-lg sm:text-xl font-bold">彡</span>
            </h3>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {availableExisting.length > 0 && (
              <div className="relative" data-existing-dropdown>
                <button
                  onClick={() => setShowExistingDropdown(!showExistingDropdown)}
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-zinc-300 text-[11px] sm:text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-1 transition-all"
                  title="Add existing subject to this month"
                >
                  <CalendarPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                  <span>Carry Over</span>
                </button>

                <AnimatePresence>
                  {showExistingDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 top-9 z-30 w-56 rounded-2xl bg-white border-2 border-zinc-800 p-2 shadow-xl"
                    >
                      <div className="text-[11px] font-bold text-zinc-500 uppercase px-2 py-1">
                        Select subject to plan in {monthName}:
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {availableExisting.map((s) => (
                          <button
                            key={s.id}
                            onClick={async () => {
                              await onAddExistingToMonth(s.id, monthId);
                              setShowExistingDropdown(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between"
                          >
                            <span className="truncate">{s.title}</span>
                            <span className="text-[10px] text-zinc-500">
                              {s.completed_lectures}/{s.total_lectures}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#ECFDF5] border-2 border-zinc-800 text-zinc-900 font-bold text-xs sm:text-base hover:bg-emerald-100 flex items-center gap-1 sm:gap-1.5 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.1)] active:translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 stroke-[3]" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>

        {/* Subjects List */}
        <div className="space-y-3 sm:space-y-3.5">
          <AnimatePresence>
            {subjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 sm:py-12 px-4 text-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50"
              >
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📚</div>
                <h4 className="font-bold text-zinc-800 text-sm sm:text-base mb-1 font-display">
                  No subjects planned for {monthName} yet
                </h4>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-3 sm:mb-4">
                  Add a subject you want to master this month, or carry over an existing one.
                </p>
                <button
                  onClick={onOpenAddModal}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  <span>Add First Subject</span>
                </button>
              </motion.div>
            ) : (
              subjects.map((subject, index) => {
                const plan = subject.monthly_plans.find((p) => p.month === monthId);
                const isUrgent = plan?.is_urgent ?? false;
                const percent =
                  subject.total_lectures > 0
                    ? Math.round((subject.completed_lectures / subject.total_lectures) * 100)
                    : 0;
                const isComplete = subject.completed_lectures >= subject.total_lectures;
                const theme = CARD_THEMES[index % CARD_THEMES.length];

                return (
                  <motion.div
                    key={subject.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setEditingSubject(subject)}
                    className={`relative group rounded-2xl border-2 transition-all p-3.5 sm:p-3 shadow-xs ${theme.bg} ${theme.border} sm:bg-white sm:border-zinc-200/80 sm:hover:border-zinc-400 sm:hover:bg-zinc-50/60 sm:shadow-xs flex flex-col justify-between cursor-pointer`}
                  >
                    {/* ========================================================================= */}
                    {/* MOBILE VIEW (< sm) - Matches Uploaded Mobile Mockup                       */}
                    {/* ========================================================================= */}
                    <div className="sm:hidden flex flex-col gap-2.5">
                      {/* Top Row: Icon with radiating sketch rays + Title + Stepper + 3 dots */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Icon with radiating sketch rays & watercolor blob */}
                          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                            {/* 3 Radiating hand-drawn sketch rays */}
                            <svg
                              className={`absolute -inset-1 w-13 h-13 pointer-events-none ${theme.ray}`}
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

                            {/* Soft organic watercolor splash blob */}
                            <div
                              className={`absolute inset-0.5 rounded-[45%_55%_65%_35%/50%_60%_40%_50%] ${theme.blob}`}
                            />

                            {/* Actual Icon */}
                            {renderIcon(subject.icon)}
                          </div>

                          {/* Title & Urgent Tag */}
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-extrabold text-base text-zinc-950 font-display truncate max-w-[130px]">
                                {subject.title}
                              </span>
                              <span className="text-emerald-500 font-hand font-bold text-base select-none shrink-0">
                                彡
                              </span>
                              {isComplete && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </div>

                            {/* Teacher name if assigned */}
                            {subject.teacher && (
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-600">
                                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate max-w-[130px]">{subject.teacher}</span>
                              </div>
                            )}

                            {/* Urgent Badge / Toggle */}
                            <div>
                              {isUrgent ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleUrgent(subject.id, monthId, true);
                                  }}
                                  className="px-2.5 py-0.5 rounded-full bg-rose-100/90 border border-rose-200 text-[11px] font-bold text-rose-600 inline-flex items-center gap-1 hover:bg-rose-200 transition-colors cursor-pointer"
                                  title="Urgent: must complete this month. Click to toggle."
                                >
                                  <Bell className="w-3 h-3 fill-rose-500 text-rose-500" />
                                  <span>Urgent</span>
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleUrgent(subject.id, monthId, false);
                                  }}
                                  className="px-2.5 py-0.5 rounded-full bg-slate-100/90 border border-slate-200 text-[11px] font-semibold text-slate-600 inline-flex items-center gap-1 hover:bg-slate-200 transition-colors cursor-pointer"
                                  title="Click to mark as Urgent"
                                >
                                  <span>+ Mark Urgent</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Stepper Counter + 3-Dots Menu */}
                        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                          {/* Stepper Pill */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center rounded-full border-2 border-zinc-800 bg-white shadow-xs px-2.5 py-0.5 h-8 gap-2.5"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecrement(subject);
                              }}
                              disabled={subject.completed_lectures <= 0 || loadingSubjectId === subject.id}
                              className="w-5 h-5 flex items-center justify-center text-zinc-800 hover:text-zinc-950 active:scale-90 disabled:opacity-30 transition-transform cursor-pointer font-bold"
                              title="Decrement 1 lecture"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <div
                              className={`w-5 h-5 rounded-full ${theme.pillNum} flex items-center justify-center font-black text-xs text-zinc-950 font-display`}
                            >
                              {subject.completed_lectures}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIncrement(subject);
                              }}
                              disabled={
                                subject.completed_lectures >= subject.total_lectures ||
                                loadingSubjectId === subject.id
                              }
                              className="w-5 h-5 flex items-center justify-center text-zinc-800 hover:text-zinc-950 active:scale-90 disabled:opacity-30 transition-transform cursor-pointer font-bold"
                              title="Log 1 completed lecture"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>

                          {/* 3-Dots Menu */}
                          <div className="relative" data-subject-menu={subject.id}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === subject.id ? null : subject.id);
                              }}
                              className="w-7 h-7 rounded-full hover:bg-zinc-200/60 flex items-center justify-center text-zinc-700 cursor-pointer"
                              title="Subject options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {activeMenuId === subject.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-white border-2 border-zinc-800 p-1.5 shadow-xl"
                                >
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      await onToggleUrgent(subject.id, monthId, isUrgent);
                                    }}
                                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 hover:bg-zinc-100 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Bell className="w-3.5 h-3.5 text-zinc-600" />
                                    <span>{isUrgent ? "Unmark Urgent" : "Mark as Urgent"}</span>
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      setEditingSubject(subject);
                                    }}
                                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 hover:bg-zinc-100 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-zinc-600" />
                                    <span>Edit Subject Details</span>
                                  </button>

                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      await onRemoveFromMonth(subject.id, monthId);
                                    }}
                                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <CalendarPlus className="w-3.5 h-3.5" />
                                    <span>Remove from {monthName}</span>
                                  </button>

                                  <div className="my-1 border-t border-zinc-200" />

                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      if (confirm(`Delete "${subject.title}" completely?`)) {
                                        await onDeleteSubject(subject.id);
                                      }
                                    }}
                                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Subject</span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* Full-width Progress Bar */}
                      <div className="w-full h-2.5 rounded-full bg-zinc-200/80 overflow-hidden p-0.5">
                        <motion.div
                          className={`h-full rounded-full ${
                            isComplete ? "bg-emerald-600" : "bg-emerald-500"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, percent)}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>

                      {/* Bottom Row: Lectures Count & Percentage Pill */}
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-800 font-display pt-0.5">
                        <div
                          className="flex items-center gap-1.5 group/edit text-left text-zinc-700"
                        >
                          <span>
                            {subject.completed_lectures} / {subject.total_lectures} lectures
                          </span>
                          <Edit3 className="w-3 h-3 text-zinc-400 group-hover/edit:text-zinc-700 transition-colors" />
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-black text-xs ${theme.badge}`}
                        >
                          {percent}%
                        </span>
                      </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* DESKTOP VIEW (sm:+) - Preserved Original Mockup Layout                    */}
                    {/* ========================================================================= */}
                    <div className="hidden sm:flex sm:items-center justify-between gap-4 w-full">
                      {/* Left: Icon + Title + Teacher + Urgent badge */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                          {renderIcon(subject.icon)}
                        </div>

                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-base text-zinc-900 font-display truncate max-w-[200px]">
                              {subject.title}
                            </span>
                            {isComplete && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>

                          {subject.teacher && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600">
                              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[200px]">{subject.teacher}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 pt-0.5">
                            {isUrgent ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleUrgent(subject.id, monthId, true);
                                }}
                                className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700 flex items-center gap-1 hover:bg-rose-100 transition-colors cursor-pointer"
                                title="Urgent: must complete this month. Click to toggle."
                              >
                                <Bell className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                                <span>Urgent</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleUrgent(subject.id, monthId, false);
                                }}
                                className="px-2 py-0.5 rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 transition-colors cursor-pointer"
                                title="Click to mark as Urgent"
                              >
                                + Mark Urgent
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Progress Bar & Lecture Ratio */}
                      <div className="flex-1 flex items-center gap-4 px-3">
                        <div className="flex-1 h-3 rounded-full bg-zinc-200/90 overflow-hidden p-0.5">
                          <motion.div
                            className={`h-full rounded-full ${
                              isComplete ? "bg-emerald-600" : "bg-emerald-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, percent)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 text-sm font-semibold text-zinc-600 font-display shrink-0">
                          <div
                            className="flex items-center gap-1 group/edit text-zinc-700"
                          >
                            <span>
                              {subject.completed_lectures} / {subject.total_lectures}
                            </span>
                            <Edit3 className="w-3 h-3 text-zinc-400 group-hover/edit:text-zinc-700 transition-colors" />
                          </div>
                          <span className="font-bold text-zinc-900">
                            {percent}%
                          </span>
                        </div>
                      </div>

                      {/* Right: Stepper Counter Controls & Actions */}
                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center rounded-full border-2 border-zinc-800 bg-white shadow-xs overflow-hidden"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecrement(subject);
                            }}
                            disabled={subject.completed_lectures <= 0 || loadingSubjectId === subject.id}
                            className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-30 transition-colors cursor-pointer"
                            title="Decrement 1 lecture"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <div className="px-2.5 min-w-[28px] text-center font-extrabold text-sm text-zinc-900 font-display">
                            {subject.completed_lectures}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIncrement(subject);
                            }}
                            disabled={
                              subject.completed_lectures >= subject.total_lectures ||
                              loadingSubjectId === subject.id
                            }
                            className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-30 transition-colors cursor-pointer"
                            title="Log 1 completed lecture"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Desktop Dropdown Options Menu */}
                        <div className="relative" data-subject-menu={subject.id}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === subject.id ? null : subject.id);
                            }}
                            className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                            title="Subject options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          <AnimatePresence>
                            {activeMenuId === subject.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-9 z-30 w-44 rounded-2xl bg-white border-2 border-zinc-800 p-1.5 shadow-xl"
                              >
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    await onToggleUrgent(subject.id, monthId, isUrgent);
                                  }}
                                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 hover:bg-zinc-100 flex items-center gap-2 cursor-pointer"
                                >
                                  <Bell className="w-3.5 h-3.5 text-zinc-600" />
                                  <span>{isUrgent ? "Unmark Urgent" : "Mark as Urgent"}</span>
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    setEditingSubject(subject);
                                  }}
                                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 hover:bg-zinc-100 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-zinc-600" />
                                  <span>Edit Subject Details</span>
                                </button>

                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    await onRemoveFromMonth(subject.id, monthId);
                                  }}
                                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <CalendarPlus className="w-3.5 h-3.5" />
                                  <span>Remove from {monthName}</span>
                                </button>

                                <div className="my-1 border-t border-zinc-200" />

                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    if (confirm(`Delete "${subject.title}" completely?`)) {
                                      await onDeleteSubject(subject.id);
                                    }
                                  }}
                                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Subject</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Subject Details Modal */}
      <EditSubjectModal
        isOpen={Boolean(editingSubject)}
        subject={editingSubject}
        onClose={() => setEditingSubject(null)}
        onSave={async (subjectId, data) => {
          if (onUpdateSubject) {
            await onUpdateSubject(subjectId, data);
          } else if (onUpdateSubjectTotal) {
            await onUpdateSubjectTotal(subjectId, data.totalLectures);
          }
        }}
      />
    </div>
  );
}
