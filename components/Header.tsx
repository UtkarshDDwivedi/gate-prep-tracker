"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, LogOut, LogIn, Clock, BookOpen } from "lucide-react";
import { authClient } from "@/lib/auth/client";

interface HeaderProps {
  currentDateText?: string;
  compactDateText?: string;
  onOpenAuthModal?: (mode?: "signin" | "signup") => void;
  onRefreshData?: () => void;
}

export function Header({
  currentDateText = "Nov 12, 2026",
  compactDateText = "Nov 12",
  onOpenAuthModal,
  onRefreshData,
}: HeaderProps) {
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const session = authClient.useSession();
  const user = session.data?.user;

  useEffect(() => {
    if (!showAuthMenu) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest("[data-auth-menu]")) {
        setShowAuthMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowAuthMenu(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAuthMenu]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.warn("Upstream sign-out warning (cleaning up session locally):", err);
    } finally {
      setShowAuthMenu(false);
      // Clean up any neon-auth client cookies
      if (typeof document !== "undefined") {
        document.cookie.split(";").forEach((c) => {
          const name = c.split("=")[0].trim();
          if (name.includes("neon-auth")) {
            document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
          }
        });
      }
      if (onRefreshData) {
        onRefreshData();
      }
      window.location.reload();
    }
  };

  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-3 sm:py-6 px-2.5 sm:px-3 select-none">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1 group cursor-pointer shrink-0">
        <div className="relative">
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-zinc-900 font-display flex items-center gap-1">
            <span>GATE Tracker</span>
            <span className="text-emerald-500 font-hand text-lg sm:text-xl font-bold">彡</span>
          </h1>
          {/* Hand-drawn marker green underline */}
          <div className="h-0.5 sm:h-1 w-12 sm:w-16 bg-emerald-400 rounded-full mt-0.5 group-hover:w-full transition-all duration-300" />
        </div>
      </Link>

      {/* Right Controls: Subjects + History + Date Pill & User Avatar / Sign In */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Subjects Page Link Button (Desktop only, mobile accesses via profile dialog) */}
        <Link
          href="/subjects"
          className="hidden sm:flex px-3.5 py-1.5 rounded-full border-2 border-zinc-800 bg-white hover:bg-emerald-50 hover:border-emerald-500 font-bold text-sm text-zinc-800 shadow-xs items-center gap-1.5 font-display shrink-0 transition-all active:scale-95"
          title="View all GATE syllabus subjects"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Subjects</span>
        </Link>

        {/* History Page Link Button (Desktop only, mobile accesses via profile dialog) */}
        <Link
          href="/history"
          className="hidden sm:flex px-3.5 py-1.5 rounded-full border-2 border-zinc-800 bg-white hover:bg-amber-50 hover:border-amber-500 font-bold text-sm text-zinc-800 shadow-xs items-center gap-1.5 font-display shrink-0 transition-all active:scale-95"
          title="View your daily lecture history"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>History</span>
        </Link>

        {/* Date Pill - Compact on Mobile, Full on Desktop */}
        <div className="px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full border-2 border-zinc-800 bg-white font-bold text-xs sm:text-sm text-zinc-800 shadow-xs flex items-center gap-1 sm:gap-1.5 font-display shrink-0">
          <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-700 shrink-0" />
          <span className="sm:hidden">{compactDateText}</span>
          <span className="hidden sm:inline">{currentDateText}</span>
        </div>

        {/* User Profile Avatar with Neon Auth indicator or Sign In Button */}
        {user ? (
          <div className="relative shrink-0" data-auth-menu>
            <button
              onClick={() => setShowAuthMenu(!showAuthMenu)}
              className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1.5 sm:gap-2 text-zinc-800 shadow-xs transition-all active:scale-95 cursor-pointer"
              aria-label="User Profile"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] sm:text-xs">
                {user.name ? user.name.substring(0, 1).toUpperCase() : "U"}
              </div>
              <span className="font-bold text-xs sm:text-sm text-emerald-950 max-w-[80px] sm:max-w-[100px] truncate hidden sm:inline">
                {user.name || "Aspirant"}
              </span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Auth Menu Dropdown */}
            {showAuthMenu && (
              <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl bg-white border-2 border-zinc-800 p-3 shadow-xl">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-200">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-800 text-sm">
                    {user.name ? user.name.substring(0, 1).toUpperCase() : "U"}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="font-bold text-xs text-zinc-900 truncate">
                      {user.name || "GATE Aspirant"}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <Link
                    href="/subjects"
                    onClick={() => setShowAuthMenu(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl font-bold text-zinc-800 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>GATE Subjects</span>
                  </Link>

                  <Link
                    href="/history"
                    onClick={() => setShowAuthMenu(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl font-bold text-zinc-800 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Study History</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full mt-1 text-left px-2.5 py-1.5 rounded-xl font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => onOpenAuthModal?.("signin")}
            className="px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full border-2 border-zinc-800 bg-white hover:bg-emerald-50 hover:border-emerald-600 flex items-center gap-1 sm:gap-1.5 font-bold text-xs sm:text-sm text-zinc-800 shadow-xs transition-all active:scale-95 cursor-pointer font-display shrink-0"
          >
            <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-700" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
