import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { MatchStatusBadge } from "@/components/ui/Badge";
import { Trophy } from "lucide-react";
import type { MatchCardTeam } from "./MatchCard";

export interface BracketMatch {
  id: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  homeTeam: MatchCardTeam | null;
  awayTeam: MatchCardTeam | null;
  homeScore: number | null;
  awayScore: number | null;
}

export interface BracketRound {
  id: string;
  name: string;
  order: number;
  matches: BracketMatch[];
}

const MATCH_HEIGHT = 84;

export function KnockoutBracket({ rounds }: { rounds: BracketRound[] }) {
  if (rounds.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="Bracket not generated yet"
        description="Generate fixtures once all teams have been registered to see the bracket."
      />
    );
  }

  const firstRoundCount = rounds[0]?.matches.length ?? 1;
  const containerHeight = firstRoundCount * MATCH_HEIGHT;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-10" style={{ minHeight: containerHeight }}>
        {rounds.map((round, roundIdx) => (
          <div key={round.id} className="flex w-56 shrink-0 flex-col justify-around" style={{ minHeight: containerHeight }}>
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">{round.name}</p>
            <div className="flex h-full flex-col justify-around">
              {round.matches.map((match) => (
                <div key={match.id} className="relative py-2">
                  <BracketMatchCard match={match} />
                  {roundIdx < rounds.length - 1 && (
                    <span className="absolute right-[-2.5rem] top-1/2 h-px w-10 bg-border" />
                  )}
                  {roundIdx > 0 && <span className="absolute left-[-2.5rem] top-1/2 h-px w-10 bg-border" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketMatchCard({ match }: { match: BracketMatch }) {
  const winnerId =
    match.status === "COMPLETED" && match.homeScore !== null && match.awayScore !== null
      ? match.homeScore > match.awayScore
        ? match.homeTeam?.id
        : match.awayScore > match.homeScore
          ? match.awayTeam?.id
          : null
      : null;

  return (
    <Link href={`/matches/${match.id}`} className="card block overflow-hidden transition-shadow hover:shadow-md">
      <BracketTeamRow team={match.homeTeam} score={match.homeScore} isWinner={!!winnerId && winnerId === match.homeTeam?.id} />
      <div className="border-t border-border" />
      <BracketTeamRow team={match.awayTeam} score={match.awayScore} isWinner={!!winnerId && winnerId === match.awayTeam?.id} />
      <div className="border-t border-border px-3 py-1.5">
        <MatchStatusBadge status={match.status} />
      </div>
    </Link>
  );
}

function BracketTeamRow({
  team,
  score,
  isWinner,
}: {
  team: MatchCardTeam | null;
  score: number | null;
  isWinner: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 px-3 py-2 text-sm ${isWinner ? "font-semibold text-foreground" : "text-muted"}`}>
      <span className="truncate">{team ? team.shortName || team.name : "TBD"}</span>
      <span>{score ?? "–"}</span>
    </div>
  );
}
