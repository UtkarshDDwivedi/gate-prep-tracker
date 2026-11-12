"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, User, LogOut, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth/client";

interface HeaderProps {
  currentDateText?: string;
}

export function Header({ currentDateText = "Nov 18, 2026" }: HeaderProps) {
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const session = authClient.useSession();
  const user = session.data?.user;

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

      {/* Right Controls: Date Pill & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Date Pill */}
        <div className="px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full border-2 border-zinc-800 bg-white font-bold text-xs sm:text-sm text-zinc-800 shadow-xs flex items-center gap-1.5 font-display">
          <CalendarIcon className="w-3.5 h-3.5 text-zinc-700" />
          <span>{currentDateText}</span>
        </div>

        {/* User Profile Avatar with Neon Auth indicator */}
        <div className="relative">
          <button
            onClick={() => setShowAuthMenu(!showAuthMenu)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-zinc-800 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-800 shadow-xs transition-all active:scale-95"
            aria-label="User Profile"
          >
            {user?.name ? (
              <span className="font-bold text-xs sm:text-sm text-emerald-800">
                {user.name.substring(0, 2).toUpperCase()}
              </span>
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700" />
            )}
          </button>

          {/* Auth Menu Dropdown */}
          {showAuthMenu && (
            <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl bg-white border-2 border-zinc-800 p-3 shadow-xl">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-xs">
                  {user?.name ? user.name.substring(0, 1) : "G"}
                </div>
                <div className="flex-1 truncate">
                  <div className="font-bold text-xs text-zinc-900 truncate">
                    {user?.name || "GATE Aspirant"}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">
                    {user?.email || "Guest Mode (Neon Synced)"}
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between px-2 py-1.5 text-zinc-600">
                  <span>Backend:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Neon Postgres
                  </span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 text-zinc-600">
                  <span>Auth:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Better Auth
                  </span>
                </div>

                {user ? (
                  <button
                    onClick={() => {
                      authClient.signOut();
                      setShowAuthMenu(false);
                    }}
                    className="w-full mt-2 text-left px-2.5 py-1.5 rounded-xl font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <div className="mt-2 text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-xl text-center">
                    Data is synced to Neon cloud automatically.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

