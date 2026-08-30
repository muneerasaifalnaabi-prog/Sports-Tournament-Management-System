"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Input, Label, Select, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function NewTournamentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"LEAGUE" | "KNOCKOUT">("LEAGUE");
  const [pointsWin, setPointsWin] = useState(3);
  const [pointsDraw, setPointsDraw] = useState(1);
  const [pointsLoss, setPointsLoss] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, format, pointsWin, pointsDraw, pointsLoss }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/tournaments/${data.tournament.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Create tournament</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Tournament name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="format">Format</Label>
              <Select id="format" value={format} onChange={(e) => setFormat(e.target.value as "LEAGUE" | "KNOCKOUT")}>
                <option value="LEAGUE">League (round-robin table)</option>
                <option value="KNOCKOUT">Knockout (single elimination)</option>
              </Select>
            </div>
            {format === "LEAGUE" && (
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
            )}
            <FieldError message={error ?? undefined} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create tournament"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
