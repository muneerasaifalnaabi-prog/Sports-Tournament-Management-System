"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/session-context";

export function MarketingNav() {
  const { user, loading } = useSession();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0e1f]/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <Trophy size={22} className="text-amber-300" />
          <span className="font-brand text-xl">STMS</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 sm:flex">
          <Link href="/tournaments" className="hover:text-white">
            Tournaments
          </Link>
          <Link href="/teams" className="hover:text-white">
            Teams
          </Link>
          <a href="#features" className="hover:text-white">
            Features
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {!loading && user ? (
            <Button href="/dashboard">Go to dashboard</Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" className="text-white hover:bg-white/10">
                Log in
              </Button>
              <Button href="/register">Get started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
