"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Zap } from "lucide-react";
import { StudyCat } from "./StudyCat";

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
    <>
      {/* ========================================================================= */}
      {/* MOBILE UI (Horizontal Split 2-Column Card matching Mockup) (< md)         */}
      {/* ========================================================================= */}
      <div className="md:hidden w-full rounded-3xl bg-[#F4F9F2] border-2 border-zinc-800 p-4 shadow-[2px_3px_0px_rgba(0,0,0,0.08)] flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-zinc-800" />
          <h3 className="font-extrabold text-base text-zinc-900 font-display flex items-center gap-1">
            <span>{monthName} · Progress &amp; Plan</span>
            <span className="text-amber-500 font-hand text-base">✦</span>
          </h3>
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-2 gap-3 items-stretch">
          {/* Left Column: Progress */}
          <div className="flex flex-col justify-between pr-2">
            <div>
              <div className="relative inline-block mb-0.5">
                <span className="text-4xl font-black text-zinc-950 font-display tracking-tight leading-none">
                  {percent}%
                </span>
                <span className="text-emerald-500 font-bold text-sm select-none font-hand ml-1">
                  ミ ✦
                </span>
              </div>
              <div className="text-xs font-semibold text-zinc-600 font-display mb-2">
                {completedLectures} / {totalLectures} lectures
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-zinc-200/80 border border-zinc-300 overflow-hidden p-0.5">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, percent)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Right Column: Urgent Plan (with left vertical divider border) */}
          <div className="border-l-2 border-dashed border-zinc-300/90 pl-3 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300/80 text-[10px] font-bold text-amber-900 mb-1">
                <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                <span>Urgent Plan</span>
              </div>

              <div className="relative inline-block my-0.5">
                <div className="text-2xl font-black text-zinc-950 font-display tracking-tight flex items-baseline gap-1">
                  <span>{dailyNeeded}</span>
                  <span className="text-xs font-bold text-zinc-700">lectures/day</span>
                </div>
                {/* Yellow highlighter underline stroke */}
                <div className="h-1 w-full bg-amber-400/80 rounded-full -mt-0.5" />
              </div>
            </div>

            <div className="text-[11px] text-zinc-600 font-medium leading-tight">
              {urgentRemaining > 0 ? (
                <>
                  <div><span className="font-bold text-zinc-900">{urgentRemaining}</span> lectures remaining</div>
                  <div><span className="font-bold text-zinc-900">{daysRemaining}</span> days left</div>
                </>
              ) : (
                <span className="text-emerald-700 font-bold text-xs">No urgent lectures left! 🎉</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP UI (Spacious Card with Study Cat at Desk) (md+)                    */}
      {/* ========================================================================= */}
      <div className="hidden md:flex relative w-full rounded-3xl bg-[#F4F9F2] border-2 border-zinc-800/80 p-6 sm:p-7 shadow-[3px_4px_0px_rgba(0,0,0,0.08)] flex-col justify-between overflow-hidden">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-zinc-800 flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4 text-zinc-800" />
            </div>
            <h3 className="font-extrabold text-lg sm:text-xl text-zinc-900 font-display flex items-center gap-1.5">
              <span>{monthName} Progress &amp; Plan</span>
              <span className="text-amber-500 font-hand text-lg">✦ 彡</span>
            </h3>
          </div>

          {/* Big Percentage & Count */}
          <div className="flex items-baseline gap-3 mb-2">
            <div className="relative inline-block">
              <span className="text-5xl sm:text-6xl font-black text-zinc-950 font-display tracking-tight">
                {percent}%
              </span>
              {/* Green accent radiating burst */}
              <span className="absolute -top-1 -right-6 text-emerald-500 font-bold text-xl select-none font-hand">
                ミ ✦
              </span>
            </div>
          </div>

          <div className="text-sm sm:text-base font-semibold text-zinc-700 font-display mb-3">
            {completedLectures} / {totalLectures} lectures
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 sm:h-4.5 rounded-full bg-zinc-200/80 border border-zinc-300 overflow-hidden p-0.5">
            <motion.div
              className="h-full rounded-full bg-emerald-500 shadow-xs"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, percent)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Dashed Separator */}
        <div className="my-5 border-t-2 border-dashed border-zinc-300/90" />

        {/* Urgent Plan Section with Cat Mascot */}
        <div className="relative flex items-end justify-between pt-1">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
                <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
              </div>
              <h4 className="font-bold text-base sm:text-lg text-zinc-900 font-display">
                Urgent Plan
              </h4>
            </div>

            <div className="relative inline-block mb-1.5">
              <div className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-display flex items-baseline gap-1">
                <span>{dailyNeeded}</span>
                <span className="text-base sm:text-lg font-bold text-zinc-800">lectures/day</span>
              </div>
              {/* Radiating sparkles */}
              <span className="absolute -top-2 -right-5 text-amber-500 font-hand text-base select-none">
                ✦ 彡
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 font-medium">
              {urgentRemaining > 0 ? (
                <>
                  <span className="font-bold text-zinc-800">{urgentRemaining}</span> urgent lectures remaining ·{" "}
                  <span className="font-bold text-zinc-800">{daysRemaining}</span> days left
                </>
              ) : (
                <span className="text-emerald-700 font-bold">All urgent subjects completed! 🎉</span>
              )}
            </p>
          </div>

          {/* Adorable Motivated Study Cat Mascot */}
          <div className="w-28 sm:w-32 shrink-0 select-none pointer-events-none -mb-3 -mr-2">
            <StudyCat />
          </div>
        </div>
      </div>
    </>
  );
}
