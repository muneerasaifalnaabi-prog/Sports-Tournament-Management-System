import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListOrdered } from "lucide-react";
import type { StandingRow } from "@/lib/standings/calculate";

export function LeagueTable({ standings }: { standings: StandingRow[] }) {
  if (standings.length === 0) {
    return (
      <EmptyState
        icon={ListOrdered}
        title="No standings yet"
        description="Standings appear once fixtures are generated."
      />
    );
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th className="w-10">#</Th>
          <Th>Team</Th>
          <Th className="text-center">P</Th>
          <Th className="text-center">W</Th>
          <Th className="text-center">D</Th>
          <Th className="text-center">L</Th>
          <Th className="text-center">GF</Th>
          <Th className="text-center">GA</Th>
          <Th className="text-center">GD</Th>
          <Th className="text-center">Pts</Th>
        </tr>
      </Thead>
      <tbody>
        {standings.map((row, idx) => (
          <Tr key={row.teamId}>
            <Td>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  idx < 3 ? "bg-brand-light text-brand" : "bg-surface-alt text-muted"
                }`}
              >
                {idx + 1}
              </span>
            </Td>
            <Td className="font-medium">{row.teamName}</Td>
            <Td className="text-center">{row.played}</Td>
            <Td className="text-center">{row.wins}</Td>
            <Td className="text-center">{row.draws}</Td>
            <Td className="text-center">{row.losses}</Td>
            <Td className="text-center">{row.goalsFor}</Td>
            <Td className="text-center">{row.goalsAgainst}</Td>
            <Td className="text-center">
              {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
            </Td>
            <Td className="text-center text-base font-bold text-brand">{row.points}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
