"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, LogOut, CheckCircle, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth/client";

interface HeaderProps {
  currentDateText?: string;
  onOpenAuthModal?: (mode?: "signin" | "signup") => void;
  onRefreshData?: () => void;
}

export function Header({
  currentDateText = "Nov 12, 2026",
  onOpenAuthModal,
  onRefreshData,
}: HeaderProps) {
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [showDateTooltip, setShowDateTooltip] = useState(false);
  const session = authClient.useSession();
  const user = session.data?.user;

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.warn("Upstream sign-out warning (cleaning up session locally):", err);
    } finally {
      setShowAuthMenu(false);
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
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-3 sm:py-5 px-3 select-none">
      {/* Logo matching mockup */}
      <div className="flex items-center gap-1.5 group cursor-pointer">
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 font-display flex items-center gap-1.5">
            <span>GATE Tracker</span>
            <span className="text-emerald-500 font-hand text-xl font-extrabold flex gap-0.5">
              <span>ミ</span>
            </span>
          </h1>
          {/* Hand-drawn marker green underline */}
          <div className="h-1.5 w-16 bg-emerald-400 rounded-full mt-0.5 group-hover:w-full transition-all duration-300" />
        </div>
      </div>

      {/* Right Controls: Date Button & User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date Button (Compact on mobile matching mockup, pill on tablet/desktop) */}
        <div className="relative">
          <button
            onClick={() => setShowDateTooltip(!showDateTooltip)}
            className="h-10 sm:h-auto px-2.5 sm:px-3.5 py-1.5 rounded-2xl sm:rounded-full border-2 border-zinc-800 bg-white hover:bg-zinc-50 font-bold text-xs sm:text-sm text-zinc-800 shadow-xs flex items-center gap-1.5 font-display transition-all active:scale-95 cursor-pointer"
            aria-label="Current Date"
          >
            <CalendarIcon className="w-4 h-4 text-zinc-800" />
            <span className="hidden sm:inline">{currentDateText}</span>
          </button>

          {/* Date Tooltip on Mobile */}
          {showDateTooltip && (
            <div className="absolute right-0 top-12 z-30 sm:hidden w-48 p-2.5 rounded-2xl bg-white border-2 border-zinc-800 shadow-lg text-xs font-semibold text-zinc-800 text-center">
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Today</div>
              <div>{currentDateText}</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1">🎯 February GATE Exam</div>
            </div>
          )}
        </div>

        {/* User Profile Avatar (Circle matching mockup) */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowAuthMenu(!showAuthMenu)}
              className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white shadow-xs transition-all active:scale-95 cursor-pointer relative"
              aria-label="User Profile"
            >
              <span className="font-extrabold text-sm font-display">
                {user.name ? user.name.substring(0, 1).toUpperCase() : "U"}
              </span>
              {/* Online sync indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
            </button>

            {/* Auth Menu Dropdown */}
            {showAuthMenu && (
              <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl bg-white border-2 border-zinc-800 p-3.5 shadow-xl">
                <div className="flex items-center gap-2.5 mb-2.5 pb-2.5 border-b border-zinc-200">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-base shrink-0">
                    {user.name ? user.name.substring(0, 1).toUpperCase() : "U"}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="font-bold text-sm text-zinc-900 truncate">
                      {user.name || "GATE Aspirant"}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between px-2 py-1 text-zinc-600">
                    <span>Database:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Neon Postgres
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 text-zinc-600">
                    <span>Auth:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Neon Auth
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full mt-2 text-left px-2.5 py-2 rounded-xl font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => onOpenAuthModal?.("signin")}
            className="h-10 px-3.5 py-1.5 rounded-full border-2 border-zinc-800 bg-white hover:bg-emerald-50 hover:border-emerald-600 flex items-center gap-1.5 font-bold text-xs sm:text-sm text-zinc-800 shadow-xs transition-all active:scale-95 cursor-pointer font-display"
          >
            <LogIn className="w-4 h-4 text-emerald-700" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
