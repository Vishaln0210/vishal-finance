"use client";
import { useState, useRef, useEffect } from "react";
import { IndianRupee, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || "nsmv2004";
const STORAGE_KEY = "finance_app_unlocked";

export default function LockScreen({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null); // null = loading
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (unlocked === false) {
      inputRef.current?.focus();
    }
  }, [unlocked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 3000);
    }
  };

  // Loading state — blank screen to prevent flash
  if (unlocked === null) {
    return (
      <div className="fixed inset-0 bg-[#0f1229] z-[9999]" />
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f1229] overflow-hidden">
      {/* Animated background gradient circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Lock card */}
      <div
        className={`relative w-full max-w-sm mx-4 ${shake ? "animate-shake" : ""}`}
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <IndianRupee className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Vishal&apos;s Finance Tracker</h1>
            <p className="text-sm text-white/40 mt-1">Enter password to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Password"
                className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-12 text-white placeholder-white/30 text-sm
                  focus:outline-none focus:ring-2 transition-all duration-200
                  ${error
                    ? "border-red-500/50 focus:ring-red-500/30"
                    : "border-white/10 focus:ring-emerald-500/30 focus:border-emerald-500/40"
                  }`}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center animate-fadeIn">
                Incorrect password. Try again.
              </p>
            )}

            <button
              type="submit"
              disabled={!password}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600
                text-white py-3 rounded-xl text-sm font-semibold
                hover:from-emerald-400 hover:to-emerald-500
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg shadow-emerald-500/20"
            >
              Unlock <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Subtle footer */}
        <p className="text-center text-white/15 text-xs mt-6">
          Personal · Private · Yours
        </p>
      </div>

    </div>
  );
}
