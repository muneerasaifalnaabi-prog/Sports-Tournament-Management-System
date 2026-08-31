"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Input, Label, Select, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";

export default function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [name, setName] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [pointsWin, setPointsWin] = useState(3);
  const [pointsDraw, setPointsDraw] = useState(1);
  const [pointsLoss, setPointsLoss] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/tournaments/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const t = d.tournament;
        setName(t.name);
        setStatus(t.status);
        setPointsWin(t.pointsWin);
        setPointsDraw(t.pointsDraw);
        setPointsLoss(t.pointsLoss);
        setLoaded(true);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status, pointsWin, pointsDraw, pointsLoss }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/tournaments/${id}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this tournament? This cannot be undone.")) return;
    const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/tournaments");
  };

  if (!loaded) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Edit tournament</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Tournament name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="DRAFT">Draft</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="pointsWin">Points: win</Label>
                <Input
                  id="pointsWin"
                  type="number"
                  min={0}
                  value={pointsWin}
                  onChange={(e) => setPointsWin(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="pointsDraw">Points: draw</Label>
                <Input
                  id="pointsDraw"
                  type="number"
                  min={0}
                  value={pointsDraw}
                  onChange={(e) => setPointsDraw(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="pointsLoss">Points: loss</Label>
                <Input
                  id="pointsLoss"
                  type="number"
                  min={0}
                  value={pointsLoss}
                  onChange={(e) => setPointsLoss(Number(e.target.value))}
                />
              </div>
            </div>
            <FieldError message={error ?? undefined} />
            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="danger" onClick={handleDelete}>
                Delete tournament
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
