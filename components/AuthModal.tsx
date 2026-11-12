"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, Lock, Mail, User, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: "signin" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "signin",
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters long");
          setLoading(false);
          return;
        }

        const res = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim(),
        });

        if (res.error) {
          setError(res.error.message || "Failed to create account. Please try again.");
          setLoading(false);
          return;
        }

        setSuccessMsg("Account created successfully! Connecting your study session...");
      } else {
        const res = await authClient.signIn.email({
          email: email.trim(),
          password,
        });

        if (res.error) {
          setError(res.error.message || "Invalid email or password.");
          setLoading(false);
          return;
        }

        setSuccessMsg("Signed in successfully! Loading your database progress...");
      }

      setTimeout(() => {
        setLoading(false);
        onSuccess();
        onClose();
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
            className="relative z-10 w-full max-w-md rounded-3xl bg-white border-2 border-zinc-800 p-6 sm:p-7 shadow-[5px_6px_0px_rgba(0,0,0,0.12)] select-none"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 rounded-full border border-zinc-300 hover:border-zinc-800 hover:bg-zinc-100 flex items-center justify-center transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-zinc-700" />
            </button>

            {/* Title & Badge */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Neon Auth &amp; Lakebase Postgres</span>
              </div>
              <h3 className="text-2xl font-black text-zinc-900 font-display flex items-center gap-2">
                <span>{mode === "signin" ? "Sign In to GATE Tracker" : "Create Your GATE Account"}</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1 font-medium">
                {mode === "signin"
                  ? "Access your personalized preparation pace and subjects synced in the cloud."
                  : "Start tracking your GATE preparation with a dedicated Neon database profile."}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex rounded-2xl bg-zinc-100 p-1 mb-5 border border-zinc-200">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === "signin"
                    ? "bg-white text-zinc-900 shadow-xs border border-zinc-300/80"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === "signup"
                    ? "bg-white text-zinc-900 shadow-xs border border-zinc-300/80"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error / Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1 font-display">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Utkarsh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-zinc-300 focus:border-emerald-600 focus:outline-hidden text-sm text-zinc-800 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1 font-display">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="aspirant@gate.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-zinc-300 focus:border-emerald-600 focus:outline-hidden text-sm text-zinc-800 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1 font-display">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-zinc-300 focus:border-emerald-600 focus:outline-hidden text-sm text-zinc-800 transition-colors"
                  />
                </div>
                {mode === "signup" && (
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Must be at least 8 characters.
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === "signin" ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Cloud footnote */}
            <div className="mt-5 text-center text-[11px] text-zinc-400">
              Database powered by <span className="font-semibold text-zinc-600">Neon Postgres</span>.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
