"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Shield, Trash2, Trophy, UserRound } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { useSession, hasRole } from "@/lib/session-context";

interface Player {
  id: string;
  name: string;
  jerseyNo: number | null;
  position: string | null;
}

interface TeamDetail {
  id: string;
  name: string;
  shortName: string | null;
  players: Player[];
  managers: { id: string; name: string }[];
  tournaments: { tournament: { id: string; name: string; status: string } }[];
}

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useSession();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/teams/${id}`);
    if (res.ok) setTeam((await res.json()).team);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!team) return <PageSpinner />;

  const canManage =
    hasRole(user, ["ADMIN", "ORGANIZER"]) || (!!user && team.managers.some((m) => m.id === user.id));

  const handleRemovePlayer = async (playerId: string) => {
    if (!confirm("Remove this player from the roster?")) return;
    await fetch(`/api/players/${playerId}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light text-brand">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{team.name}</h1>
            <p className="text-sm text-muted">{team.players.length} players on roster</p>
          </div>
        </div>
        {canManage && (
          <Button href={`/teams/${id}/edit`} variant="secondary">
            <Pencil size={15} />
            Edit team
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
          {canManage && (
            <Button onClick={() => setModalOpen(true)} variant="secondary">
              <Plus size={15} />
              Add player
            </Button>
          )}
        </CardHeader>
        {team.players.length === 0 ? (
          <EmptyState icon={UserRound} title="No players yet" description={canManage ? "Add players to build the roster." : undefined} />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th className="w-14">#</Th>
                <Th>Name</Th>
                <Th>Position</Th>
                {canManage && <Th className="w-10" />}
              </tr>
            </Thead>
            <tbody>
              {team.players.map((p) => (
                <Tr key={p.id}>
                  <Td>{p.jerseyNo ?? "–"}</Td>
                  <Td>
                    <Link href={`/players/${p.id}`} className="font-medium text-foreground hover:text-brand">
                      {p.name}
                    </Link>
                  </Td>
                  <Td className="text-muted">{p.position ?? "–"}</Td>
                  {canManage && (
                    <Td>
                      <button onClick={() => handleRemovePlayer(p.id)} className="text-muted hover:text-red-600" aria-label="Remove player">
                        <Trash2 size={15} />
                      </button>
                    </Td>
                  )}
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tournaments</CardTitle>
        </CardHeader>
        {team.tournaments.length === 0 ? (
          <EmptyState icon={Trophy} title="Not entered in any tournaments" />
        ) : (
          <ul className="divide-y divide-border">
            {team.tournaments.map(({ tournament }) => (
              <li key={tournament.id} className="px-5 py-3 text-sm">
                <Link href={`/tournaments/${tournament.id}`} className="font-medium text-foreground hover:text-brand">
                  {tournament.name}
                </Link>
                <span className="ml-2 text-xs text-muted">{tournament.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AddPlayerModal open={modalOpen} onClose={() => setModalOpen(false)} teamId={id} onAdded={load} />
    </div>
  );
}

function AddPlayerModal({
  open,
  onClose,
  teamId,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  teamId: string;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [jerseyNo, setJerseyNo] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          jerseyNo: jerseyNo ? Number(jerseyNo) : undefined,
          position: position || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setName("");
      setJerseyNo("");
      setPosition("");
      onAdded();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add player">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="playerName">Name</Label>
          <Input id="playerName" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="jerseyNo">Jersey no.</Label>
            <Input id="jerseyNo" type="number" min={0} value={jerseyNo} onChange={(e) => setJerseyNo(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Forward" />
          </div>
        </div>
        <FieldError message={error ?? undefined} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding…" : "Add player"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
