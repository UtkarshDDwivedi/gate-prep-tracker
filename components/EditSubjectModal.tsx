"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Laptop,
  Code2,
  Layers,
  Database,
  Calculator,
  BookOpen,
  Terminal,
  BarChart3,
  Monitor,
  AlertCircle,
  Plus,
  Minus,
  GraduationCap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Subject } from "./MonthlySubjectsCard";

export interface UpdateSubjectPayload {
  title: string;
  teacher: string;
  totalLectures: number;
  completedLectures: number;
}

interface EditSubjectModalProps {
  isOpen: boolean;
  subject: Subject | null;
  onClose: () => void;
  onSave: (subjectId: string, data: UpdateSubjectPayload) => Promise<void>;
}

function renderSubjectIcon(iconName: string) {
  const props = { className: "w-5 h-5 text-zinc-900" };
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
}

interface EditSubjectFormProps {
  subject: Subject;
  onClose: () => void;
  onSave: (subjectId: string, data: UpdateSubjectPayload) => Promise<void>;
}

function EditSubjectForm({ subject, onClose, onSave }: EditSubjectFormProps) {
  const [title, setTitle] = useState<string>(subject.title || "");
  const [teacher, setTeacher] = useState<string>(subject.teacher || "");
  const [totalLectures, setTotalLectures] = useState<number>(subject.total_lectures || 1);
  const [completedLectures, setCompletedLectures] = useState<number>(subject.completed_lectures || 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdjustTotal = (delta: number) => {
    setTotalLectures((prev) => {
      const nextTotal = Math.max(1, prev + delta);
      setCompletedLectures((comp) => Math.min(comp, nextTotal));
      return nextTotal;
    });
  };

  const handleAdjustCompleted = (delta: number) => {
    setCompletedLectures((prev) => Math.max(0, Math.min(totalLectures, prev + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Subject title cannot be empty");
      return;
    }
    if (isNaN(totalLectures) || totalLectures < 1) {
      setError("Total lectures must be at least 1");
      return;
    }
    const safeCompleted = Math.max(0, Math.min(totalLectures, isNaN(completedLectures) ? 0 : completedLectures));

    setSubmitting(true);
    setError(null);
    try {
      await onSave(subject.id, {
        title: title.trim(),
        teacher: teacher.trim(),
        totalLectures,
        completedLectures: safeCompleted,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subject details");
    } finally {
      setSubmitting(false);
    }
  };

  const percent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  const isComplete = completedLectures >= totalLectures && totalLectures > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      className="relative w-full max-w-lg rounded-3xl bg-[#FAF9F5] border-2 border-zinc-900 p-6 sm:p-7 shadow-[5px_6px_0px_rgba(0,0,0,0.15)] overflow-hidden max-h-[90vh] overflow-y-auto"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 w-8 h-8 rounded-full border-2 border-zinc-800 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors cursor-pointer z-10"
        title="Close dialog"
      >
        <X className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-5 pr-8">
        <div className="w-12 h-12 rounded-2xl border-2 border-zinc-900 bg-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
          {renderSubjectIcon(subject.icon)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-black text-xl text-zinc-900 font-display">
              Subject Details
            </h3>
            <span className="text-amber-500 font-hand text-lg">✦</span>
          </div>
          <p className="text-xs font-semibold text-zinc-500">
            Edit title, assigned teacher, lectures & progress
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 font-display">
            Subject Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Operating Systems, Theory of Computation"
            className="w-full px-4 py-2 rounded-xl border-2 border-zinc-800 bg-white text-zinc-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm shadow-xs"
          />
        </div>

        {/* Teacher / Faculty Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 font-display flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Teacher / Faculty</span>
          </label>
          <input
            type="text"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            placeholder="e.g. Vishvadeep Gothi, Amit Khurana, Ravindrababu Ravula"
            className="w-full px-4 py-2 rounded-xl border-2 border-zinc-800 bg-white text-zinc-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm shadow-xs"
          />
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Add your instructor or YouTube/coaching faculty name for reference.
          </span>
        </div>

        {/* Total Planned Lectures Stepper */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 font-display">
            Total Planned Lectures
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjustTotal(-5)}
              className="px-2.5 py-2 rounded-xl border-2 border-zinc-800 bg-white hover:bg-zinc-100 text-xs font-black text-zinc-800 active:scale-95 transition-transform cursor-pointer"
              title="Subtract 5"
            >
              -5
            </button>
            <button
              type="button"
              onClick={() => handleAdjustTotal(-1)}
              className="w-9 h-9 rounded-xl border-2 border-zinc-800 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-800 active:scale-95 transition-transform cursor-pointer"
              title="Subtract 1"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>

            <input
              type="number"
              min={1}
              max={500}
              value={totalLectures}
              onChange={(e) => {
                const nextTotal = Math.max(1, parseInt(e.target.value) || 1);
                setTotalLectures(nextTotal);
                setCompletedLectures((comp) => Math.min(comp, nextTotal));
              }}
              className="flex-1 text-center font-black text-base text-zinc-900 py-1.5 px-3 rounded-2xl border-2 border-zinc-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-display shadow-2xs"
              required
            />

            <button
              type="button"
              onClick={() => handleAdjustTotal(1)}
              className="w-9 h-9 rounded-xl border-2 border-zinc-800 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-800 active:scale-95 transition-transform cursor-pointer"
              title="Add 1"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => handleAdjustTotal(5)}
              className="px-2.5 py-2 rounded-xl border-2 border-zinc-800 bg-white hover:bg-zinc-100 text-xs font-black text-zinc-800 active:scale-95 transition-transform cursor-pointer"
              title="Add 5"
            >
              +5
            </button>
          </div>
        </div>

        {/* Completed Lectures Stepper */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 font-display">
              Completed Lectures
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCompletedLectures(0)}
                className="text-[11px] font-bold text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
              >
                Reset
              </button>
              <span className="text-zinc-300">•</span>
              <button
                type="button"
                onClick={() => setCompletedLectures(totalLectures)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                All Done (100%)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjustCompleted(-5)}
              className="px-2.5 py-2 rounded-xl border-2 border-zinc-800 bg-white hover:bg-zinc-100 text-xs font-black text-zinc-800 active:scale-95 transition-transform cursor-pointer"
              title="Subtract 5 completed"
            >
              -5
            </button>
            <button
              type="button"
              onClick={() => handleAdjustCompleted(-1)}
              className="w-9 h-9 rounded-xl border-2 border-zinc-800 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-800 active:scale-95 transition-transform cursor-pointer"
              title="Subtract 1 completed"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>

            <input
              type="number"
              min={0}
              max={totalLectures}
              value={completedLectures}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setCompletedLectures(Math.max(0, Math.min(totalLectures, val)));
              }}
              className="flex-1 text-center font-black text-base text-zinc-900 py-1.5 px-3 rounded-2xl border-2 border-zinc-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-display shadow-2xs"
              required
            />

            <button
              type="button"
              onClick={() => handleAdjustCompleted(1)}
              className="w-9 h-9 rounded-xl border-2 border-zinc-800 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-800 active:scale-95 transition-transform cursor-pointer"
              title="Add 1 completed"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => handleAdjustCompleted(5)}
              className="px-2.5 py-2 rounded-xl border-2 border-zinc-800 bg-white hover:bg-zinc-100 text-xs font-black text-zinc-800 active:scale-95 transition-transform cursor-pointer"
              title="Add 5 completed"
            >
              +5
            </button>
          </div>
        </div>

        {/* Live Progress Preview Bar */}
        <div className="p-3 rounded-2xl border-2 border-zinc-800 bg-white shadow-2xs space-y-2 mt-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-600 font-display flex items-center gap-1.5">
              <span>Progress: {completedLectures} of {totalLectures} lectures</span>
              {isComplete && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 inline" />}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 font-black font-display text-xs border border-emerald-300">
              {percent}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isComplete ? "bg-emerald-600" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-full border-2 border-zinc-300 font-bold text-xs sm:text-sm text-zinc-700 hover:text-zinc-950 hover:border-zinc-400 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim() || totalLectures < 1}
            className="px-5 py-2 rounded-full bg-emerald-400 border-2 border-zinc-900 font-black text-xs sm:text-sm text-zinc-950 shadow-[2px_2px_0px_rgba(0,0,0,0.2)] hover:bg-emerald-300 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>{submitting ? "Saving..." : "Save Details"}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export function EditSubjectModal({
  isOpen,
  subject,
  onClose,
  onSave,
}: EditSubjectModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !subject) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg cursor-default"
        >
          <EditSubjectForm
            key={subject.id}
            subject={subject}
            onClose={onClose}
            onSave={onSave}
          />
        </div>
      </div>
    </AnimatePresence>
  );
}
