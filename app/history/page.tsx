"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Sparkles,
  Zap,
  Flag,
  Laptop,
  Code2,
  Database,
  Calculator,
  BookOpen,
  Terminal,
  BarChart3,
  Monitor,
  Layers,
  ArrowUpDown,
  BookMarked,
  LogIn,
} from "lucide-react";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { authClient } from "@/lib/auth/client";

interface SubjectLog {
  subjectId: string;
  title: string;
  icon: string;
  count: number;
}

interface DayHistory {
  date: string; // "YYYY-MM-DD"
  dayNumber: number;
  totalLectures: number;
  subjects: SubjectLog[];
}

interface HistoryStats {
  totalDays: number;
  totalLectures: number;
  dailyAverage: string;
  firstDate: string | null;
  lastDate: string | null;
  bestDay: { date: string; count: number; dayNumber: number } | null;
}

const PALETTE = [
  {
    bg: "bg-[#F9FCF8]",
    border: "border-emerald-200/90",
    blob: "bg-emerald-100/80",
    ray: "text-emerald-500",
    badge: "bg-emerald-100 text-emerald-950 border border-emerald-300/60",
    bar: "bg-emerald-500",
  },
  {
    bg: "bg-[#FFFDF7]",
    border: "border-amber-200/90",
    blob: "bg-amber-100/80",
    ray: "text-amber-500",
    badge: "bg-amber-100 text-amber-950 border border-amber-300/60",
    bar: "bg-amber-500",
  },
  {
    bg: "bg-[#FAF8FC]",
    border: "border-purple-200/90",
    blob: "bg-purple-100/80",
    ray: "text-purple-400",
    badge: "bg-purple-100 text-purple-950 border border-purple-300/60",
    bar: "bg-purple-500",
  },
  {
    bg: "bg-[#F5FBF9]",
    border: "border-teal-200/90",
    blob: "bg-teal-100/80",
    ray: "text-teal-500",
    badge: "bg-teal-100 text-teal-950 border border-teal-300/60",
    bar: "bg-teal-500",
  },
];

export default function HistoryPage() {
  const [days, setDays] = useState<DayHistory[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Default chronological: Day 1 first
  const [showAuthModal, setShowAuthModal] = useState(false);

  const session = authClient.useSession();
  const user = session.data?.user;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
      const res = await fetch(`/api/history?tz=${encodeURIComponent(tz)}`, { cache: "no-store" });
      const data = await res.json();
      if (data.status === "ok") {
        setDays(data.days || []);
        setStats(data.stats || null);
      } else {
        setError(data.error || "Failed to load history");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
        const res = await fetch(`/api/history?tz=${encodeURIComponent(tz)}`, { cache: "no-store" });
        const data = await res.json();
        if (!ignore && data.status === "ok") {
          setDays(data.days || []);
          setStats(data.stats || null);
        } else if (!ignore) {
          setError(data.error || "Failed to load history");
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Network error");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [user?.id]);

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const renderIcon = (iconName: string) => {
    const props = { className: "w-4 h-4 text-zinc-900 relative z-10" };
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

  const displayDays = [...days].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.date.localeCompare(b.date);
    }
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-zinc-900 font-sans pb-16">
      {/* Header */}
      <Header onOpenAuthModal={() => setShowAuthModal(true)} onRefreshData={fetchHistory} />

      <main className="max-w-4xl mx-auto px-3 sm:px-6">
        {/* Navigation Breadcrumb / Back Link */}
        <div className="flex items-center justify-between mb-4 pt-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-zinc-800 bg-white hover:bg-emerald-50 text-xs sm:text-sm font-bold text-zinc-800 shadow-xs transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Road to GATE</span>
          </Link>

          {/* Sort Order Toggle */}
          {days.length > 1 && (
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
              title="Toggle timeline order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />
              <span>
                {sortOrder === "asc" ? "Chronological (Day 1 → Latest)" : "Latest First"}
              </span>
            </button>
          )}
        </div>

        {/* Hero Title with Hand-drawn Sparkles */}
        <div className="relative text-center my-4 sm:my-6 select-none">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 font-display flex items-center justify-center gap-2">
            <span>Your Study History</span>
            <span className="relative inline-block mx-1">
              <span className="relative z-10 px-3 py-0.5 rounded-full bg-amber-200/80 text-zinc-900 border border-amber-400/50">
                Timeline
              </span>
              <span className="absolute -top-3 -right-4 text-amber-500 text-lg font-hand font-bold">
                ✦ 彡
              </span>
              <span className="absolute -top-3 -left-4 text-emerald-500 text-lg font-hand font-bold">
                ミ ✦
              </span>
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 font-medium max-w-md mx-auto mt-2">
            Every lecture you&apos;ve completed, logged day by day starting from the very first day of preparation.
          </p>
        </div>

        {/* Unauthenticated State */}
        {!user && !loading && (
          <div className="p-8 sm:p-12 text-center rounded-3xl border-2 border-dashed border-zinc-300 bg-white shadow-xs max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-zinc-800 flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs">
              🔒
            </div>
            <h3 className="font-extrabold text-lg sm:text-xl text-zinc-900 font-display mb-1.5">
              Sign In to View Your History
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 mb-5">
              Your preparation log, daily lecture streaks, and progress records are securely linked to your account.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Email or Google</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 py-8 max-w-2xl mx-auto">
            <div className="h-24 bg-white/70 rounded-3xl border-2 border-zinc-200 animate-pulse" />
            <div className="h-32 bg-white/70 rounded-3xl border-2 border-zinc-200 animate-pulse" />
            <div className="h-32 bg-white/70 rounded-3xl border-2 border-zinc-200 animate-pulse" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-center my-6 max-w-md mx-auto text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Content (Authenticated & Loaded) */}
        {user && !loading && (
          <>
            {/* Overview Summary Cards */}
            {stats && stats.totalDays > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-8">
                {/* Total Days */}
                <div className="p-3 sm:p-4 rounded-2xl bg-white border-2 border-zinc-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-zinc-500 text-xs font-bold font-display mb-1">
                    <span>Study Days</span>
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
                    {stats.totalDays}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium">Days with completed lectures</div>
                </div>

                {/* Total Lectures */}
                <div className="p-3 sm:p-4 rounded-2xl bg-white border-2 border-zinc-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-zinc-500 text-xs font-bold font-display mb-1">
                    <span>Total Lectures</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
                    {stats.totalLectures}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium">Completed to date</div>
                </div>

                {/* Daily Pace */}
                <div className="p-3 sm:p-4 rounded-2xl bg-white border-2 border-zinc-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-zinc-500 text-xs font-bold font-display mb-1">
                    <span>Daily Pace</span>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
                    {stats.dailyAverage}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium">Lectures per active day</div>
                </div>

                {/* Preparation Started */}
                <div className="p-3 sm:p-4 rounded-2xl bg-white border-2 border-zinc-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-zinc-500 text-xs font-bold font-display mb-1">
                    <span>First Day</span>
                    <Flag className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-zinc-950 font-display truncate">
                    {stats.firstDate ? formatDate(stats.firstDate) : "—"}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium">Day 1 of preparation</div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {days.length === 0 ? (
              <div className="p-8 sm:p-14 text-center rounded-3xl border-2 border-dashed border-zinc-300 bg-white shadow-xs max-w-lg mx-auto my-8">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border-2 border-zinc-800 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
                  📚
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-zinc-900 font-display mb-1.5">
                  No Lecture Logs Recorded Yet
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mb-6 max-w-sm mx-auto">
                  When you complete lectures on the tracker by clicking the + button, your daily milestones and subject breakdowns will appear right here!
                </p>
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  <BookMarked className="w-4 h-4" />
                  <span>Go to Tracker &amp; Log First Lecture</span>
                </Link>
              </div>
            ) : (
              /* Timeline of Days */
              <div className="relative pl-6 sm:pl-10 space-y-6 sm:space-y-8 before:absolute before:left-2.5 sm:before:left-4 before:top-4 before:bottom-4 before:w-1 before:bg-linear-to-b before:from-emerald-400 before:via-amber-400 before:to-emerald-500 before:rounded-full">
                {displayDays.map((day, dIdx) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: dIdx * 0.05 }}
                    className="relative"
                  >
                    {/* Timeline Node Badge on the vertical line */}
                    <div className="absolute -left-6 sm:-left-10 top-3 flex items-center justify-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-zinc-900 bg-white shadow-xs flex items-center justify-center font-black text-[10px] sm:text-xs text-zinc-900 font-display">
                        {day.dayNumber}
                      </div>
                    </div>

                    {/* Day Card */}
                    <div className="rounded-3xl bg-white border-2 border-zinc-800 p-4 sm:p-6 shadow-[3px_4px_0px_rgba(0,0,0,0.08)]">
                      {/* Day Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs font-display">
                            Day {day.dayNumber}
                          </span>
                          <h4 className="font-extrabold text-base sm:text-lg text-zinc-950 font-display">
                            {formatDate(day.date)}
                          </h4>
                        </div>

                        {/* Day Total Pill */}
                        <div className="px-3 py-1 rounded-full bg-[#ECFDF5] border border-emerald-300 text-emerald-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs font-display">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {day.totalLectures} {day.totalLectures === 1 ? "lecture" : "lectures"} completed
                          </span>
                        </div>
                      </div>

                      {/* Subject Breakdown Cards for that Day */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        {day.subjects.map((sub, sIdx) => {
                          const palette = PALETTE[sIdx % PALETTE.length];
                          const sharePct = Math.round((sub.count / day.totalLectures) * 100);

                          return (
                            <div
                              key={sub.subjectId}
                              className={`rounded-2xl border-2 p-3 flex items-center justify-between gap-3 ${palette.bg} ${palette.border} shadow-xs`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Icon with soft blob */}
                                <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                                  <div
                                    className={`absolute inset-0 rounded-[45%_55%_65%_35%/50%_60%_40%_50%] ${palette.blob}`}
                                  />
                                  {renderIcon(sub.icon)}
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <span className="font-extrabold text-xs sm:text-sm text-zinc-900 font-display truncate">
                                    {sub.title}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-semibold">
                                    {sharePct}% of today&apos;s lectures
                                  </span>
                                </div>
                              </div>

                              {/* Completed count badge */}
                              <div className="px-2.5 py-1 rounded-full bg-white border-2 border-zinc-800 font-black text-xs text-zinc-900 shadow-xs shrink-0 font-display">
                                +{sub.count} {sub.count === 1 ? "lec" : "lecs"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode="signin"
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          fetchHistory();
        }}
      />
    </div>
  );
}
