"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, Flag, Shield, Trophy } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MatchStatusBadge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { useSession } from "@/lib/session-context";

interface TournamentSummary {
  id: string;
  name: string;
  status: "DRAFT" | "ONGOING" | "COMPLETED";
  organizer: { id: string };
  _count: { teams: number };
}

interface MatchSummary {
  id: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  tournament: { name: string };
  homeTeam: { name: string } | null;
  awayTeam: { name: string } | null;
  refereeAssignment: { referee: { id: string } } | null;
}

export default function DashboardPage() {
  const { user } = useSession();
  const [tournaments, setTournaments] = useState<TournamentSummary[] | null>(null);
  const [matches, setMatches] = useState<MatchSummary[] | null>(null);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((d) => setTournaments(d.tournaments));
    fetch("/api/matches?status=SCHEDULED")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches));
  }, []);

  if (!user || tournaments === null || matches === null) return <PageSpinner />;

  const ongoing = tournaments.filter((t) => t.status === "ONGOING").length;
  const myTournaments = tournaments.filter((t) => t.organizer.id === user.id).length;
  const myAssignedMatches = matches.filter(
    (m) => m.refereeAssignment?.referee.id === user.id,
  ).length;
  const upcoming = matches.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Dashboard</span>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted">
          Here&apos;s what&apos;s happening across your tournaments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ongoing tournaments" value={ongoing} icon={Trophy} accent="brand" />
        <StatCard
          label="Total tournaments"
          value={tournaments.length}
          icon={Trophy}
          accent="slate"
        />
        {(user.role === "ADMIN" || user.role === "ORGANIZER") && (
          <StatCard label="My tournaments" value={myTournaments} icon={Shield} accent="green" />
        )}
        {user.role === "REFEREE" && (
          <StatCard label="My assignments" value={myAssignedMatches} icon={Flag} accent="amber" />
        )}
        <StatCard
          label="Upcoming matches"
          value={matches.length}
          icon={CalendarClock}
          accent="brand"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming matches</CardTitle>
        </CardHeader>
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No upcoming matches" />
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <Link
                    href={`/matches/${m.id}`}
                    className="font-medium text-foreground hover:text-brand"
                  >
                    {m.homeTeam?.name ?? "TBD"} vs {m.awayTeam?.name ?? "TBD"}
                  </Link>
                  <p className="text-xs text-muted">{m.tournament.name}</p>
                </div>
                <MatchStatusBadge status={m.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
