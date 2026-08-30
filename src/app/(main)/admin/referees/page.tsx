"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Select } from "@/components/ui/Input";
import { MatchStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Spinner";

interface MatchRow {
  id: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  tournament: { id: string; name: string };
  round: { name: string };
  homeTeam: { name: string } | null;
  awayTeam: { name: string } | null;
  refereeAssignment: { referee: { id: string; name: string } } | null;
}

export default function RefereeBoardPage() {
  const [matches, setMatches] = useState<MatchRow[] | null>(null);
  const [referees, setReferees] = useState<{ id: string; name: string }[]>([]);

  const load = () => {
    fetch("/api/matches?status=SCHEDULED")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches));
  };

  useEffect(() => {
    load();
    fetch("/api/users?role=REFEREE")
      .then((r) => r.json())
      .then((d) => setReferees(d.users));
  }, []);

  const handleAssign = async (matchId: string, refereeId: string) => {
    if (!refereeId) {
      await fetch(`/api/matches/${matchId}/referee`, { method: "DELETE" });
    } else {
      await fetch(`/api/matches/${matchId}/referee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refereeId }),
      });
    }
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Referee board</h1>
        <p className="text-sm text-muted">Assign referees to upcoming matches across all tournaments.</p>
      </div>

      <Card>
        {matches === null ? (
          <TableSkeleton rows={6} cols={4} />
        ) : matches.length === 0 ? (
          <EmptyState icon={Flag} title="No scheduled matches" description="Matches appear here once fixtures are generated." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Match</Th>
                <Th>Tournament</Th>
                <Th>Status</Th>
                <Th>Referee</Th>
              </tr>
            </Thead>
            <tbody>
              {matches.map((m) => (
                <Tr key={m.id}>
                  <Td>
                    <Link href={`/matches/${m.id}`} className="font-medium text-foreground hover:text-brand">
                      {m.homeTeam?.name ?? "TBD"} vs {m.awayTeam?.name ?? "TBD"}
                    </Link>
                    <p className="text-xs text-muted">{m.round.name}</p>
                  </Td>
                  <Td className="text-muted">{m.tournament.name}</Td>
                  <Td>
                    <MatchStatusBadge status={m.status} />
                  </Td>
                  <Td>
                    <Select
                      value={m.refereeAssignment?.referee.id ?? ""}
                      onChange={(e) => handleAssign(m.id, e.target.value)}
                      className="w-44"
                    >
                      <option value="">Unassigned</option>
                      {referees.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </Select>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
