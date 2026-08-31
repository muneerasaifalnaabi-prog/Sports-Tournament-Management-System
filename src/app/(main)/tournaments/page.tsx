"use client";

import { useEffect, useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Spinner";
import { TournamentCard, type TournamentCardData } from "@/components/tournaments/TournamentCard";
import { useSession, hasRole } from "@/lib/session-context";

export default function TournamentsPage() {
  const { user } = useSession();
  const [tournaments, setTournaments] = useState<TournamentCardData[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/tournaments${qs}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setTournaments(data.tournaments))
      .catch(() => {});
    return () => controller.abort();
  }, [statusFilter]);

  const canCreate = hasRole(user, ["ADMIN", "ORGANIZER"]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">Competitions</span>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Tournaments</h1>
          <p className="text-sm text-muted">Browse and manage all tournaments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </Select>
          {canCreate && (
            <Button href="/tournaments/new">
              <Plus size={16} />
              New tournament
            </Button>
          )}
        </div>
      </div>

      {tournaments === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Trophy}
            title="No tournaments yet"
            description={
              canCreate
                ? "Create your first tournament to get started."
                : "Check back once an organizer creates a tournament."
            }
            action={
              canCreate ? <Button href="/tournaments/new">Create tournament</Button> : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  );
}
