import { EmptyState } from "@/components/ui/EmptyState";
import { CalendarClock } from "lucide-react";
import { MatchCard, type MatchCardData } from "./MatchCard";

export interface RoundWithMatches {
  id: string;
  name: string;
  order: number;
  matches: MatchCardData[];
}

export function MatchList({ rounds }: { rounds: RoundWithMatches[] }) {
  const hasMatches = rounds.some((r) => r.matches.length > 0);
  if (!hasMatches) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No fixtures yet"
        description="Generate fixtures once all teams have been registered."
      />
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <div key={round.id}>
          <h4 className="mb-2 text-sm font-semibold text-foreground">{round.name}</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {round.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
