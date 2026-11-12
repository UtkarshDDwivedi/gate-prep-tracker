"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  CheckCircle2,
  CalendarPlus,
  MoreVertical,
  Trash2,
  Laptop,
  Code,
  Layers,
  Network,
  Cpu,
  Brain,
  Calculator,
  Database,
  Terminal,
  FolderGit2,
  Bell,
  Pencil,
} from "lucide-react";

export interface MonthlyPlan {
  month: string; // e.g. "2026-11"
  is_urgent: boolean;
}

export interface Subject {
  id: string;
  title: string;
  icon: string;
  total_lectures: number;
  completed_lectures: number;
  monthly_plans: MonthlyPlan[];
}

interface MonthlySubjectsCardProps {
  monthName: string;
  monthId: string;
  subjects: Subject[];
  allSubjects: Subject[];
  onOpenAddModal: () => void;
  onLogLecture: (subjectId: string, delta: number) => Promise<void>;
  onToggleUrgent: (subjectId: string, month: string, isUrgent: boolean) => Promise<void>;
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

  const renderIcon = (iconName: string) => {
    const props = { className: "w-4 h-4 text-emerald-800 shrink-0" };
    switch (iconName) {
      case "code":
        return <Code {...props} />;
      case "layers":
        return <Layers {...props} />;
      case "graph":
      case "network":
        return <Network {...props} />;
      case "cpu":
        return <Cpu {...props} />;
      case "brain":
        return <Brain {...props} />;
      case "math":
        return <Calculator {...props} />;
      case "database":
        return <Database {...props} />;
      case "terminal":
        return <Terminal {...props} />;
      case "folder":
        return <FolderGit2 {...props} />;
      case "laptop":
      default:
        return <Laptop {...props} />;
    }
  };

  const handleIncrement = async (subject: Subject) => {
    if (subject.completed_lectures >= subject.total_lectures) return;
    setLoadingSubjectId(subject.id);
    try {
      await onLogLecture(subject.id, 1);
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

  // Subjects not yet planned in this month
  const availableExisting = allSubjects.filter(
    (s) => !s.monthly_plans.some((p) => p.month === monthId)
  );

  return (
    <div className="relative w-full rounded-3xl bg-white border-2 border-zinc-800/80 p-4 sm:p-6 shadow-[2px_3px_0px_rgba(0,0,0,0.06)] flex flex-col justify-between select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 border-2 border-zinc-800 flex items-center justify-center shadow-2xs shrink-0">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800" />
            </div>
            <h3 className="font-extrabold text-lg sm:text-xl text-zinc-900 font-display">
              {monthName} · Subjects
            </h3>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {availableExisting.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExistingDropdown(!showExistingDropdown)}
                  className="px-2.5 py-1 rounded-full border border-zinc-300 text-[11px] sm:text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-1 transition-all cursor-pointer"
                  title="Carry over existing subject"
                >
                  <CalendarPlus className="w-3 h-3 text-emerald-600" />
                  <span>Carry Over</span>
                </button>

                <AnimatePresence>
                  {showExistingDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 top-8 z-30 w-52 rounded-2xl bg-white border-2 border-zinc-800 p-2 shadow-xl"
                    >
                      <div className="text-[10px] font-bold text-zinc-400 uppercase px-2 py-1 font-display">
                        Select subject to carry over:
                      </div>
                      <div className="max-h-44 overflow-y-auto space-y-1">
                        {availableExisting.map((s) => (
                          <button
                            key={s.id}
                            onClick={async () => {
                              await onAddExistingToMonth(s.id, monthId);
                              setShowExistingDropdown(false);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between cursor-pointer"
                          >
                            <span className="truncate">{s.title}</span>
                            <span className="text-[10px] text-zinc-400 shrink-0 ml-1">
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

            {/* Header + Add Subject button */}
            <button
              onClick={onOpenAddModal}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-emerald-50 border-2 border-zinc-800 text-zinc-900 font-bold text-xs sm:text-sm hover:bg-emerald-100 flex items-center gap-1 transition-all shadow-2xs active:translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>

        {/* Subjects List (Mobile-first, compact rows matching mockup) */}
        <div className="space-y-2.5 sm:space-y-3">
          <AnimatePresence>
            {subjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 px-4 text-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50"
              >
                <div className="text-3xl mb-1.5">📚</div>
                <h4 className="font-bold text-zinc-800 text-sm sm:text-base mb-1 font-display">
                  No subjects planned for {monthName} yet
                </h4>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-3">
                  Add subjects to track daily progress and pace towards February GATE.
                </p>
                <button
                  onClick={onOpenAddModal}
                  className="px-4 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
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
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="relative group p-2.5 sm:p-3 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60 transition-all flex items-center justify-between gap-2 sm:gap-3"
                  >
                    {/* Left: Icon */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50/60 border border-zinc-200 flex items-center justify-center shrink-0">
                      {renderIcon(subject.icon)}
                    </div>

                    {/* Middle: Title, Urgent Tag & Compact Progress Bar */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 mb-1 truncate">
                        <span className="font-bold text-xs sm:text-sm text-zinc-900 font-display truncate">
                          {subject.title}
                        </span>

                        {isComplete ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : isUrgent ? (
                          <button
                            onClick={() => onToggleUrgent(subject.id, monthId, true)}
                            className="px-1.5 py-0.2 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-700 flex items-center gap-0.5 shrink-0 hover:bg-rose-100 transition-colors"
                            title="Urgent: must complete this month. Tap to toggle."
                          >
                            <Bell className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                            <span>Urgent</span>
                          </button>
                        ) : null}
                      </div>

                      {/* Progress Bar under title */}
                      <div className="w-full max-w-[120px] sm:max-w-[180px] h-1.5 sm:h-2 rounded-full bg-zinc-200/90 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            isComplete ? "bg-emerald-600" : "bg-emerald-500"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, percent)}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Right: Ratio, Percent & Stepper Controls matching mockup */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {/* Ratio and % */}
                      <div className="text-right shrink-0">
                        <div className="text-[11px] sm:text-xs font-semibold text-zinc-600 font-display whitespace-nowrap">
                          {subject.completed_lectures} / {subject.total_lectures}
                        </div>
                        <div className="text-[10px] sm:text-xs font-bold text-zinc-900 font-display">
                          {percent}%
                        </div>
                      </div>

                      {/* Stepper Pill [ - ] [ count ] [ + ] */}
                      <div className="flex items-center rounded-xl border border-zinc-300 sm:border-2 sm:border-zinc-800 bg-white shadow-2xs overflow-hidden h-7 sm:h-8">
                        <button
                          onClick={() => handleDecrement(subject)}
                          disabled={subject.completed_lectures <= 0 || loadingSubjectId === subject.id}
                          className="w-6 h-full sm:w-7 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-25 transition-colors cursor-pointer"
                          aria-label="Decrement"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <div className="px-1.5 min-w-[20px] sm:min-w-[24px] text-center font-extrabold text-xs sm:text-sm text-zinc-900 font-display">
                          {subject.completed_lectures}
                        </div>
                        <button
                          onClick={() => handleIncrement(subject)}
                          disabled={
                            subject.completed_lectures >= subject.total_lectures ||
                            loadingSubjectId === subject.id
                          }
                          className="w-6 h-full sm:w-7 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-25 transition-colors cursor-pointer"
                          aria-label="Increment"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Dropdown Options Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === subject.id ? null : subject.id)
                          }
                          className="w-7 h-7 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                          aria-label="Options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === subject.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-white border-2 border-zinc-800 p-1.5 shadow-xl text-xs"
                            >
                              <button
                                onClick={async () => {
                                  setActiveMenuId(null);
                                  await onToggleUrgent(subject.id, monthId, isUrgent);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-xl font-semibold text-zinc-800 hover:bg-zinc-100 flex items-center gap-2 cursor-pointer"
                              >
                                <Bell className="w-3.5 h-3.5 text-zinc-600" />
                                <span>{isUrgent ? "Unmark Urgent" : "Mark as Urgent"}</span>
                              </button>

                              <button
                                onClick={async () => {
                                  setActiveMenuId(null);
                                  await onRemoveFromMonth(subject.id, monthId);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-xl font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
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
                                className="w-full text-left px-2.5 py-1.5 rounded-xl font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
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

      {/* Floating Action Button (Pencil Icon matching mobile mockup) */}
      <motion.button
        onClick={onOpenAddModal}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 right-6 z-40 w-13 h-13 sm:hidden rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-zinc-900 shadow-[2px_3px_8px_rgba(0,0,0,0.25)] flex items-center justify-center cursor-pointer select-none"
        aria-label="Quick Add Subject"
      >
        <Pencil className="w-5 h-5 stroke-[2.5]" />
        {/* Playful hand-drawn sparkle */}
        <span className="absolute -top-1 -left-1 text-amber-300 text-xs font-hand font-bold pointer-events-none">
          ✦
        </span>
      </motion.button>
    </div>
  );
}
