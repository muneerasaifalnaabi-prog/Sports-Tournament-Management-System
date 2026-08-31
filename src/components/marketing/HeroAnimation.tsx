"use client";

import { useEffect, useState } from "react";
import { Trophy, Volleyball, Medal, Flag } from "lucide-react";

function useMatchClock(startMinute: number) {
  const [minute, setMinute] = useState(startMinute);

  useEffect(() => {
    const id = setInterval(() => {
      setMinute((m) => (m >= 90 ? 1 : m + 1));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return minute;
}

export function HeroAnimation() {
  const minute = useMatchClock(67);

  return (
    <div className="relative inline-flex w-full max-w-sm items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-2xl backdrop-blur-md animate-in sm:max-w-md">
      <Trophy
        size={22}
        className="hero-orbit pointer-events-none hidden shrink-0 text-amber-300/90 sm:block"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <span className="badge badge-live bg-red-500/15 text-red-300">
            <span className="live-dot" />
            LIVE
          </span>
          <span className="scoreboard-digit text-xs font-semibold tracking-wide text-white/70">
            {minute}&apos;
          </span>
        </div>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <Volleyball size={14} className="text-white/50" />
            Falcons FC
          </span>
          <span className="scoreboard-digit rounded bg-white/10 px-2 py-0.5 text-base">2</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <Medal size={14} className="text-white/50" />
            Ocean United
          </span>
          <span className="scoreboard-digit rounded bg-white/10 px-2 py-0.5 text-base">1</span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-white/50">
          <Flag size={11} />
          City League &middot; Matchday 4
        </p>
      </div>
    </div>
  );
}
