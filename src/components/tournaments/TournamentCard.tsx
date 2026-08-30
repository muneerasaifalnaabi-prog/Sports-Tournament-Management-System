import Link from "next/link";
import { Trophy, Users, Swords } from "lucide-react";

export interface TournamentCardData {
  id: string;
  name: string;
  format: "LEAGUE" | "KNOCKOUT";
  status: "DRAFT" | "ONGOING" | "COMPLETED";
  _count?: { teams: number; matches: number };
}

const statusStyle: Record<TournamentCardData["status"], string> = {
  DRAFT: "badge-scheduled",
  ONGOING: "badge-live",
  COMPLETED: "badge-completed",
};

export function TournamentCard({ tournament }: { tournament: TournamentCardData }) {
  return (
    <Link href={`/tournaments/${tournament.id}`} className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand">
          <Trophy size={18} />
        </div>
        <span className={`badge ${statusStyle[tournament.status]}`}>{tournament.status}</span>
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{tournament.name}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          <Swords size={13} />
          {tournament.format === "LEAGUE" ? "League" : "Knockout"}
        </p>
      </div>
      {tournament._count && (
        <div className="mt-auto flex items-center gap-1 text-xs text-muted">
          <Users size={13} />
          {tournament._count.teams} team{tournament._count.teams === 1 ? "" : "s"}
        </div>
      )}
    </Link>
  );
}
