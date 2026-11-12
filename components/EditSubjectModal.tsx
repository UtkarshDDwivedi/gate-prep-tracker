"use client";

import React, { useState } from "react";
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
  Edit3,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import { Subject } from "./MonthlySubjectsCard";

interface EditSubjectModalProps {
  isOpen: boolean;
  subject: Subject | null;
  onClose: () => void;
  onSave: (subjectId: string, newTotal: number) => Promise<void>;
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
  onSave: (subjectId: string, newTotal: number) => Promise<void>;
}

function EditSubjectForm({ subject, onClose, onSave }: EditSubjectFormProps) {
  const [totalLectures, setTotalLectures] = useState<number>(subject.total_lectures);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdjust = (delta: number) => {
    setTotalLectures((prev) => Math.max(1, prev + delta));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(totalLectures) || totalLectures < 1) {
      setError("Total lectures must be at least 1");
      return;
    }

    setSubmitting(true);
    try {
      await onSave(subject.id, totalLectures);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update total lectures");
    } finally {
      setSubmitting(false);
    }
  };

  const willReduceCompleted = totalLectures < subject.completed_lectures;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      className="relative w-full max-w-md rounded-3xl bg-[#FAF9F5] border-2 border-zinc-900 p-6 sm:p-7 shadow-[5px_6px_0px_rgba(0,0,0,0.15)] overflow-hidden"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-8 h-8 rounded-full border-2 border-zinc-800 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl border-2 border-zinc-900 bg-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
          {renderSubjectIcon(subject.icon)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-black text-xl text-zinc-900 font-display">
              Edit Total Lectures
            </h3>
            <Edit3 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs font-semibold text-zinc-500">
            {subject.title} • currently {subject.completed_lectures} completed
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Input field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
            Total Planned Lectures
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjust(-5)}
              className="px-2.5 py-2 rounded-xl border-2 border-zinc-800 bg-white hover:bg-zinc-100 text-xs font-black text-zinc-800 active:scale-95 transition-transform cursor-pointer"
              title="Subtract 5"
            >
              -5
            </button>
            <button
              type="button"
              onClick={() => handleAdjust(-1)}
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
              onChange={(e) => setTotalLectures(parseInt(e.target.value) || 0)}
              className="flex-1 text-center font-black text-lg text-zinc-900 py-1.5 px-3 rounded-2xl border-2 border-zinc-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-display"
              required
            />

            <button
              type="button"
              onClick={() => handleAdjust(1)}
              className="w-9 h-9 rounded-xl border-2 border-zinc-800 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-800 active:scale-95 transition-transform cursor-pointer"
              title="Add 1"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => handleAdjust(5)}
              className="px-2.5 py-2 rounded-xl border-2 border-zinc-800 bg-white hover:bg-zinc-100 text-xs font-black text-zinc-800 active:scale-95 transition-transform cursor-pointer"
              title="Add 5"
            >
              +5
            </button>
          </div>
        </div>

        {/* Warning if reducing total below completed */}
        {willReduceCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Notice: Setting total to <strong>{totalLectures}</strong> will reduce your completed lectures from <strong>{subject.completed_lectures}</strong> to <strong>{totalLectures}</strong>.
            </span>
          </motion.div>
        )}

        {error && (
          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-full border-2 border-zinc-300 font-bold text-xs sm:text-sm text-zinc-600 hover:text-zinc-900 hover:border-zinc-400 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || totalLectures < 1}
            className="px-5 py-2 rounded-full bg-emerald-400 border-2 border-zinc-900 font-black text-xs sm:text-sm text-zinc-950 shadow-[2px_2px_0px_rgba(0,0,0,0.2)] hover:bg-emerald-300 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Saving..." : "Save Changes"}
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
  if (!isOpen || !subject) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
        <EditSubjectForm
          key={subject.id}
          subject={subject}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </AnimatePresence>
  );
}
