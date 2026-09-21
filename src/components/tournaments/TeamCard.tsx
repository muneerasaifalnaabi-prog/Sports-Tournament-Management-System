import Link from "next/link";
import { Shield, Users } from "lucide-react";

export interface TeamCardData {
  id: string;
  name: string;
  shortName: string | null;
  _count: { players: number };
}

export function TeamCard({ team }: { team: TeamCardData }) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
        <Shield size={18} />
      </div>
      <div className="min-w-0">
        <h3 className="truncate font-semibold text-foreground">{team.name}</h3>
        <p className="flex items-center gap-1 text-xs text-muted">
          <Users size={12} />
          {team._count.players} player{team._count.players === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}
