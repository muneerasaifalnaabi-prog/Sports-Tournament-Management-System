"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Shield, Users, Flag, X } from "lucide-react";
import { useSession, hasRole } from "@/lib/session-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/teams", label: "Teams", icon: Shield },
];

const adminItems = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/referees", label: "Referee Board", icon: Flag },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useSession();
  const isAdmin = hasRole(user, ["ADMIN"]);

  const content = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <Link
        href="/dashboard"
        className="mb-4 flex items-center gap-2 px-2 text-lg font-bold text-brand"
      >
        <Trophy size={22} />
        <span className="font-brand text-xl">STMS</span>
      </Link>
      {navItems.map((item) => (
        <SidebarLink
          key={item.href}
          {...item}
          active={pathname.startsWith(item.href)}
          onNavigate={onClose}
        />
      ))}
      {isAdmin && (
        <>
          <p className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Admin
          </p>
          {adminItems.map((item) => (
            <SidebarLink
              key={item.href}
              {...item}
              active={pathname.startsWith(item.href)}
              onNavigate={onClose}
            />
          ))}
        </>
      )}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:block">
        {content}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <div className="relative h-full w-60 border-r border-border bg-surface shadow-2xl">
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-muted"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-brand-light text-brand"
          : "text-muted hover:translate-x-0.5 hover:bg-surface-alt hover:text-foreground"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
      )}
      <Icon size={18} />
      {label}
    </Link>
  );
}
