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
  currentDateText = "Nov 18, 2026",
  onOpenAuthModal,
  onRefreshData,
}: HeaderProps) {
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const session = authClient.useSession();
  const user = session.data?.user;

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setShowAuthMenu(false);
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 sm:py-6 px-3 select-none">
      {/* Logo */}
      <div className="flex items-center gap-1.5 group cursor-pointer">
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 font-display flex items-center gap-1">
            <span>GATE Tracker</span>
            <span className="text-emerald-500 font-hand text-xl font-bold">彡</span>
          </h1>
          {/* Hand-drawn marker green underline */}
          <div className="h-1 w-16 bg-emerald-400 rounded-full mt-0.5 group-hover:w-full transition-all duration-300" />
        </div>
      </div>

      {/* Right Controls: Date Pill & User Avatar / Sign In */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date Pill */}
        <div className="px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full border-2 border-zinc-800 bg-white font-bold text-xs sm:text-sm text-zinc-800 shadow-xs flex items-center gap-1.5 font-display">
          <CalendarIcon className="w-3.5 h-3.5 text-zinc-700" />
          <span>{currentDateText}</span>
        </div>

        {/* User Profile Avatar with Neon Auth indicator or Sign In Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowAuthMenu(!showAuthMenu)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2 text-zinc-800 shadow-xs transition-all active:scale-95 cursor-pointer"
              aria-label="User Profile"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {user.name ? user.name.substring(0, 1).toUpperCase() : "U"}
              </div>
              <span className="font-bold text-xs sm:text-sm text-emerald-950 max-w-[100px] truncate hidden sm:inline">
                {user.name || "Aspirant"}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                  <div className="flex items-center justify-between px-2 py-1.5 text-zinc-600">
                    <span>Database:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Neon Postgres
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-zinc-600">
                    <span>Auth:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Neon Auth
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full mt-2 text-left px-2.5 py-1.5 rounded-xl font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
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
            className="px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full border-2 border-zinc-800 bg-white hover:bg-emerald-50 hover:border-emerald-600 flex items-center gap-1.5 font-bold text-xs sm:text-sm text-zinc-800 shadow-xs transition-all active:scale-95 cursor-pointer font-display"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-700" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}

