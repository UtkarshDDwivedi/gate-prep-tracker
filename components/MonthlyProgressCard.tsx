"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Zap } from "lucide-react";

interface MonthlyProgressCardProps {
  monthName: string;
  monthId: string; // e.g. "2026-11"
  totalLectures: number;
  completedLectures: number;
  urgentRemaining: number;
  daysRemaining: number;
}

export function MonthlyProgressCard({
  monthName,
  totalLectures,
  completedLectures,
  urgentRemaining,
  daysRemaining,
}: MonthlyProgressCardProps) {
  const percent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  
  // Calculate daily pace needed for urgent subjects
  const dailyNeeded =
    urgentRemaining > 0 && daysRemaining > 0
      ? (urgentRemaining / daysRemaining).toFixed(1)
      : "0";

  return (
    <div className="w-full rounded-3xl bg-[#F6FAF4] border-2 border-zinc-800/80 p-4 sm:p-5 shadow-[2px_3px_0px_rgba(0,0,0,0.06)] flex flex-col justify-between overflow-hidden select-none">
      {/* Card Header matching mockup */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white border-2 border-zinc-800 flex items-center justify-center shadow-2xs">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-800" />
        </div>
        <h3 className="font-extrabold text-base sm:text-xl text-zinc-900 font-display flex items-center gap-1.5">
          <span>{monthName} · Progress &amp; Plan</span>
          <span className="text-amber-500 font-hand text-base sm:text-lg">✦</span>
        </h3>
      </div>

      {/* 2-Column Responsive Split matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center sm:divide-x sm:divide-zinc-200">
        {/* Left Column: Overall Month Progress */}
        <div className="flex flex-col sm:pr-4">
          <div className="flex items-baseline gap-2 mb-0.5">
            <div className="relative inline-block">
              <span className="text-4xl sm:text-5xl font-black text-zinc-950 font-display tracking-tight">
                {percent}%
              </span>
              {/* Radiating green sparkles */}
              <span className="absolute -top-1 -right-6 text-emerald-500 font-bold text-lg select-none font-hand">
                ミ ✦
              </span>
            </div>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-zinc-600 font-display mb-2">
            {completedLectures} / {totalLectures} lectures
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-zinc-200/80 border border-zinc-300 overflow-hidden p-0.5">
            <motion.div
              className="h-full rounded-full bg-emerald-500 shadow-2xs"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, percent)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Right Column: Urgent Plan Pace */}
        <div className="flex flex-col sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-dashed border-zinc-200">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300/80 flex items-center gap-1 text-[11px] font-bold text-amber-900">
              <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
              <span>Urgent Plan</span>
            </div>
          </div>

          <div className="relative inline-block mb-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-display flex items-baseline gap-1">
              <span>{dailyNeeded}</span>
              <span className="text-xs sm:text-sm font-bold text-zinc-700">lectures/day</span>
            </div>
            {/* Hand-drawn amber underline */}
            <div className="h-1 w-20 bg-amber-400 rounded-full mt-0.5" />
          </div>

          <p className="text-[11px] sm:text-xs text-zinc-600 font-medium leading-relaxed">
            {urgentRemaining > 0 ? (
              <>
                <span className="font-bold text-zinc-800">{urgentRemaining} lectures remaining</span>
                <br />
                <span className="text-zinc-500">{daysRemaining} days left</span>
              </>
            ) : totalLectures > 0 ? (
              <span className="text-emerald-700 font-bold">✨ No urgent backlog this month!</span>
            ) : (
              <span className="text-zinc-400">Add urgent subjects to set pace</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
