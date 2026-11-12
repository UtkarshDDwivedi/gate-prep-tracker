"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Plus,
  Minus,
  Bell,
  Laptop,
  Code2,
  Share2,
  Database,
  Calculator,
  BookOpen,
  Terminal,
  MoreVertical,
  Trash2,
  CalendarPlus,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface Subject {
  id: string;
  title: string;
  icon: string;
  total_lectures: number;
  completed_lectures: number;
  monthly_plans: Array<{
    month: string;
    is_urgent: boolean;
  }>;
}

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
}: MonthlySubjectsCardProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showExistingDropdown, setShowExistingDropdown] = useState(false);
  const [loadingSubjectId, setLoadingSubjectId] = useState<string | null>(null);

  // Helper for subject icons
  const renderIcon = (iconName: string) => {
    const props = { className: "w-4 h-4 sm:w-5 sm:h-5 text-zinc-800" };
    switch (iconName) {
      case "code":
        return <Code2 {...props} />;
      case "layers":
        return <Layers {...props} />;
      case "graph":
        return <Share2 {...props} />;
      case "database":
        return <Database {...props} />;
      case "math":
        return <Calculator {...props} />;
      case "terminal":
        return <Terminal {...props} />;
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
    <div className="relative w-full rounded-3xl bg-white border-2 border-zinc-800/80 p-4 sm:p-7 shadow-[3px_4px_0px_rgba(0,0,0,0.08)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 border-2 border-zinc-800 flex items-center justify-center shadow-xs">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800" />
            </div>
            <h3 className="font-extrabold text-lg sm:text-2xl text-zinc-900 font-display">
              {monthName} · Subjects
            </h3>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {availableExisting.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExistingDropdown(!showExistingDropdown)}
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-1 transition-all"
                  title="Add existing subject to this month"
                >
                  <CalendarPlus className="w-3 h-3 text-emerald-600" />
                  <span className="hidden sm:inline">Carry Over</span>
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
                              setShowExistingDropdown(false);
                              await onAddExistingToMonth(s.id, monthId);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between transition-colors"
                          >
                            <span className="truncate">{s.title}</span>
                            <span className="text-[10px] text-zinc-400">
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

            {/* Add Subject Button */}
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 border-zinc-800 bg-[#ECFDF5] hover:bg-emerald-100 text-zinc-900 font-bold text-xs sm:text-sm flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer font-display"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>

        {/* Subjects List (Mobile-First Compact Rows + Desktop Spacious Card) */}
        <div className="divide-y divide-zinc-100 sm:divide-y-0 sm:space-y-3">
          <AnimatePresence>
            {subjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 px-4 text-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50"
              >
                <div className="text-3xl mb-2">📚</div>
                <h4 className="font-bold text-zinc-800 text-sm sm:text-base mb-1 font-display">
                  No subjects planned for {monthName} yet
                </h4>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-4">
                  Add a subject you want to master this month, or carry over an existing one.
                </p>
                <button
                  onClick={onOpenAddModal}
                  className="px-4 py-2 rounded-full bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all inline-flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add First Subject</span>
                </button>
              </motion.div>
            ) : (
              subjects.map((subject) => {
                const plan = subject.monthly_plans.find((p) => p.month === monthId);
                const isUrgent = plan?.is_urgent ?? false;
                const percent =
                  subject.total_lectures > 0
                    ? Math.round((subject.completed_lectures / subject.total_lectures) * 100)
                    : 0;
                const isComplete = subject.completed_lectures >= subject.total_lectures;

                return (
                  <motion.div
                    key={subject.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative group py-2.5 px-0.5 sm:p-3 sm:rounded-2xl sm:border sm:border-zinc-200/80 sm:hover:border-zinc-300 sm:hover:bg-zinc-50/60 transition-all flex items-center justify-between gap-2 sm:gap-3"
                  >
                    {/* Left: Icon */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-100 border border-zinc-200/90 flex items-center justify-center shrink-0">
                      {renderIcon(subject.icon)}
                    </div>

                    {/* Center Column: Subject Title + Urgent Tag + Progress Bar */}
                    <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-xs sm:text-base text-zinc-900 font-display truncate">
                          {subject.title}
                        </span>

                        {isComplete && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}

                        {/* Urgent Badge / Toggle */}
                        {isUrgent ? (
                          <button
                            onClick={() => onToggleUrgent(subject.id, monthId, true)}
                            className="px-1.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-700 flex items-center gap-0.5 hover:bg-rose-100 transition-colors shrink-0"
                            title="Urgent: must complete this month. Click to toggle."
                          >
                            <Bell className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                            <span>Urgent</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggleUrgent(subject.id, monthId, false)}
                            className="hidden sm:inline-flex px-1.5 py-0.5 rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 transition-colors shrink-0"
                            title="Click to mark as Urgent"
                          >
                            + Urgent
                          </button>
                        )}
                      </div>

                      {/* Progress Bar directly under title */}
                      <div className="w-full h-1.5 sm:h-2 rounded-full bg-zinc-200/80 overflow-hidden p-px mt-1 max-w-md">
                        <motion.div
                          className={`h-full rounded-full ${
                            isComplete ? "bg-emerald-600" : "bg-emerald-500"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, percent)}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Right: Lecture Fraction & Percentage */}
                    <div className="text-right shrink-0 flex items-baseline sm:items-center gap-1.5 sm:gap-2 font-display">
                      <span className="text-[11px] sm:text-sm font-semibold text-zinc-600 min-w-[38px] sm:min-w-[48px]">
                        {subject.completed_lectures}/{subject.total_lectures}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 min-w-[28px] sm:min-w-[36px]">
                        {percent}%
                      </span>
                    </div>

                    {/* Right: Stepper Counter Controls [-] count [+] & Menu */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Counter Pill [ - ] [ count ] [ + ] */}
                      <div className="flex items-center rounded-full border border-zinc-800 sm:border-2 bg-white shadow-xs overflow-hidden h-7 sm:h-8">
                        <button
                          onClick={() => handleDecrement(subject)}
                          disabled={subject.completed_lectures <= 0 || loadingSubjectId === subject.id}
                          className="w-6 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-30 transition-colors cursor-pointer"
                          title="Decrement 1 lecture"
                        >
                          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                        </button>
                        <div className="px-1.5 sm:px-2.5 min-w-[20px] sm:min-w-[28px] text-center font-extrabold text-xs sm:text-sm text-zinc-900 font-display">
                          {subject.completed_lectures}
                        </div>
                        <button
                          onClick={() => handleIncrement(subject)}
                          disabled={
                            subject.completed_lectures >= subject.total_lectures ||
                            loadingSubjectId === subject.id
                          }
                          className="w-6 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-30 transition-colors cursor-pointer"
                          title="Log 1 completed lecture"
                        >
                          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Dropdown Options Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === subject.id ? null : subject.id)
                          }
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-800 transition-colors"
                          title="Subject options"
                        >
                          <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === subject.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-white border-2 border-zinc-800 p-1.5 shadow-xl"
                            >
                              <button
                                onClick={async () => {
                                  setActiveMenuId(null);
                                  await onToggleUrgent(subject.id, monthId, isUrgent);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 hover:bg-zinc-100 flex items-center gap-2"
                              >
                                <Bell className="w-3.5 h-3.5 text-zinc-600" />
                                <span>{isUrgent ? "Unmark Urgent" : "Mark as Urgent"}</span>
                              </button>

                              <button
                                onClick={async () => {
                                  setActiveMenuId(null);
                                  await onRemoveFromMonth(subject.id, monthId);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                              >
                                <CalendarPlus className="w-3.5 h-3.5" />
                                <span>Remove from {monthName}</span>
                              </button>

                              <div className="my-1 border-t border-zinc-200" />

                              <button
                                onClick={async () => {
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
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Button (FAB) on Mobile with Pencil Icon */}
      <div className="fixed bottom-6 right-5 z-40 sm:hidden">
        <motion.button
          onClick={onOpenAddModal}
          whileTap={{ scale: 0.9 }}
          className="w-13 h-13 rounded-full bg-emerald-700 text-white border-2 border-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.25)] flex items-center justify-center transition-all cursor-pointer hover:bg-emerald-800"
          aria-label="Add Subject"
          title="Add Subject"
        >
          <Pencil className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      </div>
    </div>
  );
}
