"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { useSession } from "@/lib/session-context";
import { RoleBadge } from "@/components/ui/Badge";

export function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <button onClick={onMenuClick} className="text-muted md:hidden" aria-label="Open menu">
        <Menu size={22} />
      </button>
      <div className="hidden md:block" />
      {user ? (
        <div className="flex items-center gap-3">
          <RoleBadge role={user.role} />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-alt text-muted">
            <UserIcon size={16} />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-surface-alt hover:text-foreground"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      ) : (
        <div className="h-9 w-24 animate-pulse rounded-lg bg-surface-alt" />
      )}
    </header>
  );
}
