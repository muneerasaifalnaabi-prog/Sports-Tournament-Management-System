"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Spinner";
import { useSession, hasRole } from "@/lib/session-context";

interface TeamListItem {
  id: string;
  name: string;
  shortName: string | null;
  _count: { players: number };
}

export default function TeamsPage() {
  const { user } = useSession();
  const [teams, setTeams] = useState<TeamListItem[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/teams${q ? `?q=${encodeURIComponent(q)}` : ""}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setTeams(data.teams))
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  const canCreate = hasRole(user, ["ADMIN", "ORGANIZER", "TEAM_MANAGER"]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Teams</h1>
          <p className="text-sm text-muted">Browse registered teams and rosters.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search teams…" value={q} onChange={(e) => setQ(e.target.value)} className="w-48" />
          {canCreate && (
            <Button href="/teams/new">
              <Plus size={16} />
              New team
            </Button>
          )}
        </div>
      </div>

      {teams === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="card">
          <EmptyState icon={Shield} title="No teams found" description={canCreate ? "Create a team to get started." : undefined} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand">
                <Shield size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{team.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Users size={12} />
                  {team._count.players} player{team._count.players === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
