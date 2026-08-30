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
      <Link href="/dashboard" className="mb-4 flex items-center gap-2 px-2 text-lg font-bold text-brand">
        <Trophy size={22} />
        STMS
      </Link>
      {navItems.map((item) => (
        <SidebarLink key={item.href} {...item} active={pathname.startsWith(item.href)} onNavigate={onClose} />
      ))}
      {isAdmin && (
        <>
          <p className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-muted">Admin</p>
          {adminItems.map((item) => (
            <SidebarLink key={item.href} {...item} active={pathname.startsWith(item.href)} onNavigate={onClose} />
          ))}
        </>
      )}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-border bg-white md:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
          <div className="relative h-full w-60 bg-white shadow-xl">
            <button onClick={onClose} className="absolute right-3 top-3 text-muted" aria-label="Close menu">
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
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-brand-light text-brand" : "text-muted hover:bg-slate-100 hover:text-foreground"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}
