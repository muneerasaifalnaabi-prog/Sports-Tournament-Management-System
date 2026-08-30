import Link from "next/link";
import { MatchStatusBadge } from "@/components/ui/Badge";
import { CalendarDays, MapPin } from "lucide-react";

export interface MatchCardTeam {
  id: string;
  name: string;
  shortName?: string | null;
}

export interface MatchCardData {
  id: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  homeTeam: MatchCardTeam | null;
  awayTeam: MatchCardTeam | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
  scheduledAt?: string | Date | null;
  venue?: string | null;
}

function TeamLabel({ team }: { team: MatchCardTeam | null }) {
  return <span className="truncate">{team ? (team.shortName || team.name) : "TBD"}</span>;
}

export function MatchCard({ match }: { match: MatchCardData }) {
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="card flex flex-col gap-3 p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <MatchStatusBadge status={match.status} />
        {match.scheduledAt && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <CalendarDays size={13} />
            {new Date(match.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
        <TeamLabel team={match.homeTeam} />
        <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-foreground">
          {hasScore ? `${match.homeScore} - ${match.awayScore}` : "vs"}
        </span>
        <TeamLabel team={match.awayTeam} />
      </div>
      {match.homePenaltyScore != null && match.awayPenaltyScore != null && (
        <p className="text-center text-xs text-muted">
          Penalties {match.homePenaltyScore} - {match.awayPenaltyScore}
        </p>
      )}
      {match.venue && (
        <span className="flex items-center gap-1 text-xs text-muted">
          <MapPin size={13} />
          {match.venue}
        </span>
      )}
    </Link>
  );
}
