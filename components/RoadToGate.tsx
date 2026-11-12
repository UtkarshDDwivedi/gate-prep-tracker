"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Check, Calendar, Sprout, Flag } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Title with highlighter effect & hand-drawn sparkles */}
      <div className="relative text-center my-2 sm:my-3 select-none">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 font-display flex items-center justify-center gap-1.5 sm:gap-2">
          <span>Your Road to</span>
          <span className="relative inline-block mx-1">
            <span className="relative z-10 px-3 py-0.5 rounded-full bg-emerald-200/80 text-zinc-900 border border-emerald-400/40">
              GATE 2027
            </span>
            <span className="absolute -top-3 -right-4 text-amber-400 text-base sm:text-lg font-hand font-bold">
              ✦ 彡
            </span>
            <span className="absolute -top-3 -left-4 text-amber-400 text-base sm:text-lg font-hand font-bold">
              ミ ✦
            </span>
          </span>
        </h2>
      </div>

      {/* Main Container: Month Cards + Landscape */}
      <div className="w-full flex flex-col gap-3">
        {/* Swipable Month Selector Cards (No arrows, smooth touch swipe) */}
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory flex items-stretch justify-start sm:justify-center gap-2 sm:gap-3.5 py-1 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {MONTHS.map((month) => {
            const isSelected = selectedMonth === month.id;
            const stats = monthlyStats[month.id] || { total: 0, completed: 0, percent: 0, planned: false };

            return (
              <motion.button
                key={month.id}
                onClick={() => onSelectMonth(month.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className={`snap-center flex-1 min-w-[68px] sm:min-w-[88px] max-w-[100px] py-2.5 sm:py-3 px-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-between cursor-pointer relative select-none shadow-xs ${
                  isSelected
                    ? "bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/30 scale-102"
                    : "bg-white border-zinc-800 hover:border-emerald-500 hover:bg-zinc-50"
                }`}
              >
                {/* Active Sunburst rays on top */}
                {isSelected && (
                  <div className="absolute -top-3.5 text-amber-500 text-xs font-hand font-black flex gap-0.5 select-none pointer-events-none">
                    <span>ミ</span>
                    <span className="text-amber-400">|</span>
                    <span>彡</span>
                  </div>
                )}

                {/* Top Icon */}
                <div className="mb-1">
                  {month.isCutoff ? (
                    <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
                      <Flag className="w-3.5 h-3.5 text-amber-700 fill-amber-500" />
                    </div>
                  ) : month.id === "2026-10" && stats.planned ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                    </div>
                  ) : month.id === "2026-11" ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                      <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                    </div>
                  )}
                </div>

                {/* Month Name */}
                <span className={`font-bold text-xs sm:text-sm font-display leading-tight ${
                  isSelected ? "text-emerald-950 font-black" : "text-zinc-800"
                }`}>
                  {month.shortName}
                </span>

                {/* Subtitle / Status Pill text */}
                <span className={`text-[10px] sm:text-xs mt-0.5 font-medium leading-tight truncate ${
                  month.isCutoff
                    ? "font-black text-amber-800 uppercase tracking-tight"
                    : stats.planned
                    ? "font-bold text-emerald-700"
                    : "text-zinc-400"
                }`}>
                  {month.isCutoff
                    ? "GATE!"
                    : stats.planned
                    ? `${stats.percent}%`
                    : "Not planned"}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Panoramic Landscape with Hiker Cat Mascot */}
        <div className="relative w-full overflow-hidden rounded-3xl bg-linear-to-b from-[#FAF8F2] via-[#F3F8F2] to-[#E5F3E4] border-2 border-zinc-800/80 shadow-[0_3px_12px_rgba(0,0,0,0.05)] h-28 sm:h-36 flex items-end justify-between px-4 sm:px-8 select-none">
          {/* Fluffy sketched clouds */}
          <div className="absolute top-2.5 left-10 opacity-60 pointer-events-none">
            <svg width="48" height="22" viewBox="0 0 64 32" fill="none">
              <path
                d="M12 24 C8 24 4 20 6 16 C6 10 14 8 18 12 C22 6 34 6 38 12 C44 8 52 10 52 16 C56 18 56 24 50 24 Z"
                fill="#FFFFFF"
                stroke="#6B7280"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="absolute top-3 right-28 opacity-50 pointer-events-none">
            <svg width="40" height="20" viewBox="0 0 50 26" fill="none">
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
              className="w-full h-24 sm:h-32"
              viewBox="0 0 1000 160"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Back hills */}
              <path
                d="M0 120 Q 250 50, 500 90 T 800 70 L 1000 90 L 1000 160 L 0 160 Z"
                fill="#D1E7D0"
                stroke="#22C55E"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                opacity="0.6"
              />

              {/* Foreground rolling green hill */}
              <path
                d="M0 130 C 180 90, 320 120, 520 105 C 720 90, 840 120, 1000 110 L 1000 160 L 0 160 Z"
                fill="#BCDFB8"
                stroke="#15803D"
                strokeWidth="2"
              />

              {/* Bush clusters */}
              <g stroke="#166534" strokeWidth="1.5" fill="#86EFAC">
                <path d="M 60 125 C 50 115, 70 105, 80 118 C 90 108, 105 115, 100 125 Z" />
                <path d="M 380 110 C 370 100, 390 92, 400 105 C 410 96, 425 102, 420 112 Z" />
                <path d="M 680 108 C 670 98, 690 90, 700 102 C 710 94, 725 100, 720 110 Z" />
              </g>

              {/* Winding dashed trail line */}
              <path
                d="M 40 135 C 160 125, 300 130, 480 125 C 640 120, 760 115, 880 95 L 910 80"
                stroke="#1E293B"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Left: Little road grass accents */}
          <div className="relative z-10 text-emerald-800 text-[10px] font-hand font-bold opacity-60 mb-2">
            🌱 trail start
          </div>

          {/* Center: Walking Hiker Cat Mascot matching mockup */}
          <motion.div
            className="relative z-10 flex flex-col items-center mb-1.5"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* SVG of Hiker Cat with Headband, Backpack, and Walking Stick */}
            <svg width="68" height="60" viewBox="0 0 90 80" fill="none">
              {/* Walking stick */}
              <line x1="20" y1="35" x2="16" y2="76" stroke="#523B28" strokeWidth="3" strokeLinecap="round" />
              <circle cx="20" cy="35" r="3" fill="#D97706" />

              {/* Green Backpack */}
              <rect x="52" y="32" width="18" height="24" rx="7" fill="#15803D" stroke="#1F2937" strokeWidth="2.5" />
              <path d="M52 38 L70 38" stroke="#166534" strokeWidth="2" />
              <rect x="56" y="44" width="10" height="9" rx="3" fill="#22C55E" stroke="#1F2937" strokeWidth="1.5" />

              {/* Cat Body */}
              <ellipse cx="44" cy="48" rx="16" ry="18" fill="#FFFFFF" stroke="#1F2937" strokeWidth="3" />

              {/* Cat Left & Right Feet */}
              <ellipse cx="36" cy="67" rx="6" ry="4" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2.5" />
              <ellipse cx="50" cy="67" rx="6" ry="4" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2.5" />

              {/* Cat Head */}
              <ellipse cx="42" cy="27" rx="18" ry="15" fill="#FFFFFF" stroke="#1F2937" strokeWidth="3" />

              {/* Left & Right Ears */}
              <polygon points="26,17 32,2 40,14" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2.5" strokeLinejoin="round" />
              <polygon points="29,15 33,6 38,13" fill="#FCA5A5" />
              <polygon points="46,14 54,2 60,17" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2.5" strokeLinejoin="round" />
              <polygon points="48,13 53,6 57,15" fill="#FCA5A5" />

              {/* Orange Headband */}
              <path d="M24 24 Q 42 22, 60 24" stroke="#F97316" strokeWidth="6" strokeLinecap="round" />
              {/* Headband knot ties fluttering behind */}
              <path d="M58 24 C 66 22, 70 28, 72 32" stroke="#F97316" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M57 26 C 65 30, 68 36, 67 40" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />

              {/* Determined Cute Face */}
              <ellipse cx="36" cy="28" rx="2" ry="2.5" fill="#1F2937" />
              <ellipse cx="48" cy="28" rx="2" ry="2.5" fill="#1F2937" />
              {/* Eyebrows determined */}
              <path d="M33 22 L 39 25" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
              <path d="M51 25 L 45 22" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
              {/* Nose & Mouth */}
              <polygon points="42,32 40,30 44,30" fill="#F43F5E" />
              <path d="M40 33 Q 42 35, 44 33" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />

              {/* Arm holding stick */}
              <path d="M34 40 Q 25 36, 20 37" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>

          {/* Right: Snowy Mountain Peak with Golden GATE Flag */}
          <div className="relative z-10 flex flex-col items-center mb-1">
            {/* Flag */}
            <div className="relative flex items-start -mb-2">
              <div className="w-1 h-8 bg-zinc-800 rounded-full" />
              <div className="bg-amber-400 border-2 border-zinc-800 text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-xs -ml-0.5">
                GATE! 🚩
              </div>
            </div>
            {/* Mountain */}
            <svg width="74" height="46" viewBox="0 0 90 60" fill="none">
              <polygon points="45,4 6,56 84,56" fill="#A7F3D0" stroke="#1F2937" strokeWidth="2.5" strokeLinejoin="round" />
              <polygon points="45,4 32,24 38,22 45,28 52,22 58,24" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
