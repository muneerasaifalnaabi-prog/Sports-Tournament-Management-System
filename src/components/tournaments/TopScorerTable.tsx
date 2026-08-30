import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Target } from "lucide-react";
import type { TopScorerRow } from "@/lib/standings/topScorers";

export function TopScorerTable({ topScorers }: { topScorers: TopScorerRow[] }) {
  if (topScorers.length === 0) {
    return <EmptyState icon={Target} title="No goals recorded yet" description="Top scorers appear once match results include goals." />;
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th className="w-10">#</Th>
          <Th>Player</Th>
          <Th>Team</Th>
          <Th className="text-center">Goals</Th>
        </tr>
      </Thead>
      <tbody>
        {topScorers.map((row, idx) => (
          <Tr key={row.playerId}>
            <Td>{idx + 1}</Td>
            <Td className="font-medium">{row.playerName}</Td>
            <Td className="text-muted">{row.teamName}</Td>
            <Td className="text-center font-semibold text-brand">{row.goals}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
