"use client";

import { use, useCallback, useEffect, useState } from "react";
import { CalendarDays, Flag, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { MatchStatusBadge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MatchResultForm, type MatchResultFormValues } from "@/components/forms/MatchResultForm";
import { useSession, hasRole } from "@/lib/session-context";

interface MatchDetail {
  id: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  homeScore: number | null;
  awayScore: number | null;
  homePenaltyScore: number | null;
  awayPenaltyScore: number | null;
  scheduledAt: string | null;
  venue: string | null;
  tournament: { id: string; name: string; format: "LEAGUE" | "KNOCKOUT" };
  round: { name: string };
  homeTeam: { id: string; name: string; players?: never } | null;
  awayTeam: { id: string; name: string } | null;
  goals: { id: string; minute: number | null; ownGoal: boolean; player: { id: string; name: string } }[];
  refereeAssignment: { referee: { id: string; name: string; email: string } } | null;
}

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useSession();

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [homePlayers, setHomePlayers] = useState<{ id: string; name: string }[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<{ id: string; name: string }[]>([]);
  const [referees, setReferees] = useState<{ id: string; name: string }[]>([]);
  const [selectedReferee, setSelectedReferee] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/matches/${id}`);
    if (!res.ok) return;
    const data: { match: MatchDetail } = await res.json();
    setMatch(data.match);

    if (data.match.homeTeam) {
      fetch(`/api/teams/${data.match.homeTeam.id}/players`)
        .then((r) => r.json())
        .then((d) => setHomePlayers(d.players));
    }
    if (data.match.awayTeam) {
      fetch(`/api/teams/${data.match.awayTeam.id}/players`)
        .then((r) => r.json())
        .then((d) => setAwayPlayers(d.players));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!hasRole(user, ["ADMIN", "ORGANIZER"])) return;
    fetch("/api/users?role=REFEREE")
      .then((r) => r.json())
      .then((d) => setReferees(d.users));
  }, [user]);

  if (!match) return <PageSpinner />;

  const isOrganizer = hasRole(user, ["ADMIN", "ORGANIZER"]);
  const isAssignedReferee = !!user && match.refereeAssignment?.referee.id === user.id;
  const canRecordResult = (isOrganizer || isAssignedReferee) && !!match.homeTeam && !!match.awayTeam;

  const handleSubmitResult = async (values: MatchResultFormValues) => {
    const res = await fetch(`/api/matches/${id}/result`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Could not save result");
    await load();
  };

  const handleAssignReferee = async () => {
    if (!selectedReferee) return;
    await fetch(`/api/matches/${id}/referee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refereeId: selectedReferee }),
    });
    setSelectedReferee("");
    load();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted">
              {match.tournament.name} · {match.round.name}
            </span>
            <MatchStatusBadge status={match.status} />
          </div>
          <div className="flex items-center justify-between gap-4 text-center">
            <div className="flex-1">
              <p className="text-lg font-semibold text-foreground">{match.homeTeam?.name ?? "TBD"}</p>
            </div>
            <div className="rounded-lg bg-slate-100 px-4 py-2 text-2xl font-bold text-foreground">
              {match.homeScore ?? "–"} : {match.awayScore ?? "–"}
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-foreground">{match.awayTeam?.name ?? "TBD"}</p>
            </div>
          </div>
          {match.homePenaltyScore != null && match.awayPenaltyScore != null && (
            <p className="mt-2 text-center text-sm text-muted">
              Penalties: {match.homePenaltyScore} - {match.awayPenaltyScore}
            </p>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted">
            {match.scheduledAt && (
              <span className="flex items-center gap-1">
                <CalendarDays size={13} />
                {new Date(match.scheduledAt).toLocaleString()}
              </span>
            )}
            {match.venue && (
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {match.venue}
              </span>
            )}
            {match.refereeAssignment && (
              <span className="flex items-center gap-1">
                <Flag size={13} />
                {match.refereeAssignment.referee.name}
              </span>
            )}
          </div>
        </CardBody>
      </Card>

      {match.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
          </CardHeader>
          <ul className="divide-y divide-border">
            {match.goals.map((g) => (
              <li key={g.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-medium text-foreground">{g.player.name}</span>
                <span className="text-muted">
                  {g.minute != null ? `${g.minute}'` : ""} {g.ownGoal && "(own goal)"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {isOrganizer && (
        <Card>
          <CardHeader>
            <CardTitle>Referee assignment</CardTitle>
          </CardHeader>
          <CardBody>
            {match.refereeAssignment ? (
              <p className="text-sm text-foreground">
                Assigned to <span className="font-medium">{match.refereeAssignment.referee.name}</span>
              </p>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={selectedReferee} onChange={(e) => setSelectedReferee(e.target.value)} className="sm:max-w-xs">
                  <option value="">Select a referee…</option>
                  {referees.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
                <Button onClick={handleAssignReferee} disabled={!selectedReferee}>
                  Assign referee
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Record result</CardTitle>
        </CardHeader>
        <CardBody>
          <MatchResultForm
            homeTeamName={match.homeTeam?.name ?? "Home"}
            awayTeamName={match.awayTeam?.name ?? "Away"}
            players={[
              ...homePlayers.map((p) => ({ ...p, teamId: match.homeTeam!.id })),
              ...awayPlayers.map((p) => ({ ...p, teamId: match.awayTeam!.id })),
            ]}
            isKnockout={match.tournament.format === "KNOCKOUT"}
            canSubmit={canRecordResult}
            initial={{
              homeScore: match.homeScore ?? 0,
              awayScore: match.awayScore ?? 0,
              homePenaltyScore: match.homePenaltyScore,
              awayPenaltyScore: match.awayPenaltyScore,
              goals: match.goals.map((g) => ({ playerId: g.player.id, minute: g.minute, ownGoal: g.ownGoal })),
            }}
            onSubmit={handleSubmitResult}
          />
        </CardBody>
      </Card>
    </div>
  );
}
