"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export interface MonthInfo {
  id: string; // e.g. "2026-10", "2026-11", "2026-12", "2027-01", "2027-02"
  name: string; // "October", "November", "December", "January", "February"
  shortName: string;
  isCutoff?: boolean;
}

export const MONTHS: MonthInfo[] = [
  { id: "2026-10", name: "October", shortName: "Oct" },
  { id: "2026-11", name: "November", shortName: "Nov" },
  { id: "2026-12", name: "December", shortName: "Dec" },
  { id: "2027-01", name: "January", shortName: "Jan" },
  { id: "2027-02", name: "February", shortName: "Feb", isCutoff: true },
];

interface RoadToGateProps {
  selectedMonth: string;
  onSelectMonth: (monthId: string) => void;
  monthlyStats: Record<string, { total: number; completed: number; percent: number; planned: boolean }>;
}

export function RoadToGate({ selectedMonth, onSelectMonth, monthlyStats }: RoadToGateProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currentIdx = MONTHS.findIndex((m) => m.id === selectedMonth);

  const handlePrev = () => {
    if (currentIdx > 0) {
      onSelectMonth(MONTHS[currentIdx - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIdx < MONTHS.length - 1) {
      onSelectMonth(MONTHS[currentIdx + 1].id);
    }
  };

  // Auto-center selected month on mobile when selected or on initial mount
  useEffect(() => {
    if (selectedMonth && monthRefs.current[selectedMonth]) {
      monthRefs.current[selectedMonth]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedMonth]);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Title with highlighter effect & hand-drawn sparkles */}
      <div className="relative text-center my-3 select-none">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 font-display flex items-center justify-center gap-2">
          <span>Your Road to</span>
          <span className="relative inline-block mx-1">
            <span className="relative z-10 px-3 py-0.5 rounded-full bg-emerald-200/80 text-zinc-900 border border-emerald-400/40">
              GATE 2027
            </span>
            {/* Sparkle accents on title */}
            <span className="absolute -top-3 -right-4 text-amber-400 text-lg font-hand select-none font-bold">
              ✦ 彡
            </span>
            <span className="absolute -top-3 -left-4 text-amber-400 text-lg font-hand select-none font-bold">
              ミ ✦
            </span>
          </span>
        </h2>
      </div>

      {/* Outer Card Container */}
      <div className="relative w-full overflow-hidden rounded-3xl bg-linear-to-b from-[#F9F7F1] via-[#F3F8F2] to-[#E9F5E8] border-2 border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] min-h-[275px] sm:min-h-[300px] select-none">
        {/* Left Arrow Button (Retained on Desktop, Hidden on Mobile) */}
        <button
          onClick={handlePrev}
          disabled={currentIdx <= 0}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white border-2 border-zinc-800 items-center justify-center shadow-md hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-800" />
        </button>

        {/* Right Arrow Button (Retained on Desktop, Hidden on Mobile) */}
        <button
          onClick={handleNext}
          disabled={currentIdx >= MONTHS.length - 1}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white border-2 border-zinc-800 items-center justify-center shadow-md hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-zinc-800" />
        </button>

        {/* Horizontally Scrollable/Swipeable Road Container on Mobile, Full Width on Desktop */}
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto md:overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x cursor-grab active:cursor-grabbing"
        >
          <div className="relative min-w-[880px] md:min-w-full w-full min-h-[275px] sm:min-h-[300px] p-4 sm:p-6 flex items-center justify-between">
            {/* Fluffy sketched clouds */}
            <div className="absolute top-4 left-16 opacity-60 pointer-events-none">
              <svg width="64" height="32" viewBox="0 0 64 32" fill="none">
                <path
                  d="M12 24 C8 24 4 20 6 16 C6 10 14 8 18 12 C22 6 34 6 38 12 C44 8 52 10 52 16 C56 18 56 24 50 24 Z"
                  fill="#FFFFFF"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div className="absolute top-6 right-56 opacity-50 pointer-events-none">
              <svg width="50" height="26" viewBox="0 0 50 26" fill="none">
                <path
                  d="M10 20 C6 20 3 17 5 13 C5 8 11 6 15 10 C18 5 28 5 31 10 C36 7 42 8 42 13 C45 15 45 20 40 20 Z"
                  fill="#FFFFFF"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            {/* Rolling Hills Background SVG */}
            <div className="absolute inset-0 pointer-events-none flex items-end">
              <svg
                className="w-full h-44 sm:h-52"
                viewBox="0 0 1000 220"
                preserveAspectRatio="none"
                fill="none"
              >
                {/* Background rolling hills */}
                <path
                  d="M0 160 Q 250 80, 500 130 T 800 120 L 1000 140 L 1000 220 L 0 220 Z"
                  fill="#D1E7D0"
                  stroke="#22C55E"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  opacity="0.7"
                />

                {/* Foreground rich green rolling hills */}
                <path
                  d="M0 180 C 180 130, 320 170, 520 145 C 720 120, 840 165, 1000 150 L 1000 220 L 0 220 Z"
                  fill="#BCDFB8"
                  stroke="#15803D"
                  strokeWidth="2.5"
                />

                {/* Bush clusters on hills */}
                <g stroke="#166534" strokeWidth="2" fill="#86EFAC">
                  <path d="M 60 170 C 50 155, 75 145, 85 160 C 95 150, 115 155, 110 170 Z" />
                  <path d="M 230 165 C 220 150, 245 140, 255 155 C 265 145, 285 150, 280 165 Z" />
                  <path d="M 740 160 C 730 145, 755 135, 765 150 C 775 140, 795 145, 790 160 Z" />
                  <path d="M 880 165 C 870 150, 895 140, 905 155 C 915 145, 935 150, 930 165 Z" />
                </g>

                {/* Winding dashed trail line */}
                <path
                  d="M 120 175 C 200 165, 300 170, 360 168 C 440 165, 520 160, 600 165 C 680 170, 750 165, 820 145 L 850 120"
                  stroke="#1E293B"
                  strokeWidth="3.5"
                  strokeDasharray="8 8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Milestones Road Container */}
            <div className="relative z-10 w-full flex items-center justify-around px-4 md:px-12 mt-6">
              {MONTHS.map((month) => {
                const isSelected = selectedMonth === month.id;
                const stats = monthlyStats[month.id] || { total: 0, completed: 0, percent: 0, planned: false };

                if (month.isCutoff) {
                  // Mountain with February GATE Flag!
                  return (
                    <div
                      key={month.id}
                      ref={(el) => {
                        monthRefs.current[month.id] = el;
                      }}
                      onClick={() => onSelectMonth(month.id)}
                      className="flex flex-col items-center cursor-pointer group shrink-0 px-3"
                    >
                      {/* Flagpole & Peak */}
                      <motion.div
                        className="relative flex flex-col items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Golden Flag */}
                        <div className="relative -mb-1 flex items-start">
                          <div className="w-1.5 h-14 bg-zinc-800 rounded-full" />
                          <motion.div
                            className="bg-amber-400 border-2 border-zinc-800 text-zinc-900 font-bold text-sm px-2.5 py-1 rounded-sm shadow-md origin-left -ml-0.5"
                            animate={{ rotate: [-2, 4, -2] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            🚩
                          </motion.div>
                        </div>

                        {/* Mountain Graphic */}
                        <svg
                          className="w-28 h-20 sm:w-[130px] sm:h-[95px] -mt-2 sm:-mt-3"
                          viewBox="0 0 120 90"
                          fill="none"
                        >
                          {/* Mountain base */}
                          <polygon
                            points="60,8 10,88 110,88"
                            fill="#A7F3D0"
                            stroke="#1F2937"
                            strokeWidth="3"
                            strokeLinejoin="round"
                          />
                          {/* Snow cap */}
                          <polygon
                            points="60,8 40,40 50,36 60,44 70,36 80,40"
                            fill="#FFFFFF"
                            stroke="#1F2937"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                          />
                          {/* Little ridge shadows */}
                          <line x1="60" y1="8" x2="60" y2="88" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" />
                        </svg>

                        {/* February GATE Sign Card - Enlarged */}
                        <div
                          className={`-mt-3 sm:-mt-4 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border-2 border-zinc-800 font-extrabold text-sm sm:text-base shadow-md transition-all text-center min-w-[115px] sm:min-w-[130px] ${
                            isSelected
                              ? "bg-amber-300 text-zinc-950 scale-105 ring-4 ring-amber-400/40 ring-offset-1"
                              : "bg-white text-zinc-800 group-hover:bg-amber-50"
                          }`}
                        >
                          <span className="font-display">February</span>
                          <br />
                          <span className="text-emerald-700 font-black text-xs sm:text-sm uppercase tracking-wider">
                            GATE! 🎯
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  );
                }

                // Normal month signpost - Extra Large Chunky Tactile Buttons
                return (
                  <motion.div
                    key={month.id}
                    ref={(el) => {
                      monthRefs.current[month.id] = el;
                    }}
                    onClick={() => onSelectMonth(month.id)}
                    className="flex flex-col items-center cursor-pointer select-none group shrink-0 px-3"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Signpost Board - Extra Large and Chunky */}
                    <div
                      className={`relative px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl border-2 transition-all shadow-[3px_4px_0px_rgba(0,0,0,0.15)] flex flex-col items-center min-w-[125px] sm:min-w-[140px] ${
                        isSelected
                          ? "bg-white border-emerald-600 scale-105 ring-4 ring-emerald-500/25 shadow-[0_6px_16px_rgba(16,185,129,0.3)]"
                          : "bg-white border-zinc-800 group-hover:border-emerald-500 group-hover:bg-emerald-50/50"
                      }`}
                    >
                      {/* Month Name */}
                      <span
                        className={`font-black text-base sm:text-lg tracking-wide font-display ${
                          isSelected ? "text-emerald-950" : "text-zinc-800"
                        }`}
                      >
                        {month.name}
                      </span>

                      {/* Active Month Top Badge Accent */}
                      {isSelected && (
                        <div className="absolute -top-3.5 px-2.5 py-0.5 rounded-full bg-amber-400 border border-zinc-800 text-[11px] sm:text-xs font-black text-zinc-950 font-display flex items-center gap-0.5 shadow-xs">
                          <span>★ Selected</span>
                        </div>
                      )}
                    </div>

                    {/* Wooden post connecting sign to ground */}
                    <div
                      className={`w-2.5 sm:w-2.5 h-7 sm:h-9 border-x-2 border-zinc-800 transition-colors ${
                        isSelected ? "bg-emerald-500" : "bg-amber-800/80"
                      }`}
                    />

                    {/* Trail Node / Circle */}
                    <div
                      className={`w-7 h-7 sm:w-7 sm:h-7 rounded-full border-2 border-zinc-900 flex items-center justify-center shadow-xs transition-all ${
                        isSelected
                          ? "bg-emerald-500 text-white scale-110 sm:scale-125 ring-2 sm:ring-4 ring-emerald-300"
                          : stats.percent >= 80
                          ? "bg-emerald-500 text-white"
                          : stats.planned
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-white text-zinc-400"
                      }`}
                    >
                      {stats.percent >= 80 ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-current" />
                      )}
                    </div>

                    {/* Status Pill below node - Extra clear, high-contrast text */}
                    <div className="mt-1.5">
                      <div
                        className={`text-xs sm:text-xs font-bold px-3 py-1 rounded-full border border-zinc-800/60 shadow-xs flex items-center gap-1.5 whitespace-nowrap ${
                          isSelected
                            ? "bg-emerald-100 text-emerald-950 border-emerald-600"
                            : stats.percent >= 80
                            ? "bg-emerald-50 text-emerald-800"
                            : stats.planned
                            ? "bg-white text-zinc-700"
                            : "bg-zinc-100/90 text-zinc-500"
                        }`}
                      >
                        {stats.percent >= 80 ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            <span>Completed {stats.percent}%</span>
                          </>
                        ) : stats.planned ? (
                          <span>{stats.percent}% complete</span>
                        ) : (
                          <span>Not planned</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Month Swipe Indicator & Navigation Dots */}
      <div className="flex md:hidden flex-col items-center gap-1.5 mt-2.5 select-none">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-zinc-500 font-display">
            Swipe road ⇄
          </span>
          <span className="text-[10px] text-zinc-400">·</span>
          <span className="text-[11px] font-semibold text-emerald-700 font-display">
            Tap month to view
          </span>
        </div>
        <div className="flex items-center gap-2">
          {MONTHS.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMonth(m.id)}
              className={`transition-all rounded-full cursor-pointer ${
                selectedMonth === m.id
                  ? "w-6 h-2 bg-emerald-600 shadow-xs"
                  : "w-2 h-2 bg-zinc-300 hover:bg-zinc-400"
              }`}
              aria-label={`Select ${m.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

