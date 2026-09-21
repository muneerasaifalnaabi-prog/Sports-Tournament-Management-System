"use client";

import { useEffect, useState } from "react";
import { Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Spinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { TeamCard, type TeamCardData } from "@/components/tournaments/TeamCard";
import { useSession, hasRole } from "@/lib/session-context";

type TeamListItem = TeamCardData;

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
      <PageHeader
        eyebrow="Squads"
        title="Teams"
        subtitle="Browse registered teams and rosters."
        actions={
          <>
            <Input
              placeholder="Search teams…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-48"
            />
            {canCreate && (
              <Button href="/teams/new">
                <Plus size={16} />
                New team
              </Button>
            )}
          </>
        }
      />

      {teams === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Shield}
            title="No teams found"
            description={canCreate ? "Create a team to get started." : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
