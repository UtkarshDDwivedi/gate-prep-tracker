"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Laptop,
  Code2,
  Layers,
  Share2,
  Database,
  Calculator,
  BookOpen,
  Terminal,
  Bell,
} from "lucide-react";
import { MONTHS } from "./RoadToGate";

interface AddSubjectModalProps {
  isOpen: boolean;
  initialMonth: string;
  onClose: () => void;
  onCreate: (subjectData: {
    title: string;
    icon: string;
    totalLectures: number;
    completedLectures: number;
    month: string;
    isUrgent: boolean;
  }) => Promise<void>;
}

const ICONS = [
  { id: "laptop", label: "Laptop", Icon: Laptop },
  { id: "code", label: "Code", Icon: Code2 },
  { id: "layers", label: "Layers", Icon: Layers },
  { id: "graph", label: "Graph", Icon: Share2 },
  { id: "database", label: "Database", Icon: Database },
  { id: "math", label: "Math", Icon: Calculator },
  { id: "terminal", label: "Terminal", Icon: Terminal },
  { id: "book", label: "Book", Icon: BookOpen },
];

export function AddSubjectModal({
  isOpen,
  initialMonth,
  onClose,
  onCreate,
}: AddSubjectModalProps) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("laptop");
  const [totalLectures, setTotalLectures] = useState(30);
  const [completedLectures, setCompletedLectures] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || totalLectures <= 0) return;

    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        icon,
        totalLectures: Number(totalLectures),
        completedLectures: Number(completedLectures),
        month: selectedMonth,
        isUrgent,
      });
      // Reset form
      setTitle("");
      setTotalLectures(30);
      setCompletedLectures(0);
      setIsUrgent(false);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#FAF9F5] border-2 border-zinc-900 p-6 sm:p-7 shadow-[5px_6px_0px_rgba(0,0,0,0.15)] overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full border-2 border-zinc-800 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Modal Header */}
          <div className="mb-5">
            <h3 className="font-extrabold text-2xl text-zinc-900 font-display flex items-center gap-2">
              <span>Add New Subject</span>
              <span className="text-amber-500 font-hand text-xl">✦ 彡</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              Add a GATE subject and allocate it to your study roadmap.
            </p>
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
                placeholder="e.g. Theory of Computation, Computer Networks"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-800 bg-white text-zinc-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm shadow-xs"
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 font-display">
                Choose Icon
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ICONS.map((item) => {
                  const IconComp = item.Icon;
                  const isSel = icon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIcon(item.id)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border-2 transition-all ${
                        isSel
                          ? "bg-emerald-100 border-emerald-700 text-emerald-900 font-bold shadow-xs scale-102"
                          : "bg-white border-zinc-300 text-zinc-600 hover:border-zinc-800"
                      }`}
                    >
                      <IconComp className="w-5 h-5 mb-1" />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Numbers: Total Lectures & Completed */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 font-display">
                  Total Lectures
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={totalLectures}
                  onChange={(e) => setTotalLectures(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-zinc-800 bg-white text-zinc-900 font-bold text-sm shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 font-display">
                  Completed So Far
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalLectures}
                  value={completedLectures}
                  onChange={(e) => setCompletedLectures(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-zinc-800 bg-white text-zinc-900 font-bold text-sm shadow-xs"
                />
              </div>
            </div>

            {/* Target Month Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 font-display">
                Plan for Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border-2 border-zinc-800 bg-white text-zinc-900 font-semibold text-sm shadow-xs"
              >
                {MONTHS.filter((m) => !m.isCutoff).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgent Flag Toggle */}
            <div className="p-3.5 rounded-2xl border-2 border-zinc-800 bg-amber-50/70 flex items-start gap-3">
              <input
                id="urgent-checkbox"
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded-md border-2 border-zinc-800 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="urgent-checkbox" className="text-xs sm:text-sm text-zinc-800 cursor-pointer">
                <span className="font-bold text-rose-700 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 fill-rose-600" />
                  Urgent Subject for this month
                </span>
                <span className="text-zinc-600 block text-[11px] mt-0.5 leading-snug">
                  Must be completed in this month. Contributes directly to your daily required pace.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full border-2 border-zinc-400 font-bold text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 border-2 border-zinc-900 font-bold text-sm text-white transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.15)] active:translate-y-0.5 disabled:opacity-50"
              >
                {submitting ? "Adding..." : "+ Add Subject"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

