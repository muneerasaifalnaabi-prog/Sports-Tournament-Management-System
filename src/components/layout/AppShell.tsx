"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopNav onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 bg-background p-4 md:p-6">
          <div key={pathname} className="animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
