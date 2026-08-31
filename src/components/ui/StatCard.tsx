import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "brand" | "green" | "amber" | "slate";
}

const accentClass: Record<NonNullable<StatCardProps["accent"]>, string> = {
  brand: "bg-brand-light text-brand",
  green: "bg-[rgb(47_208_124_/_0.15)] text-[#2fd07c]",
  amber: "bg-[rgb(240_180_40_/_0.15)] text-[#f0b428]",
  slate: "bg-surface-alt text-muted",
};

const barClass: Record<NonNullable<StatCardProps["accent"]>, string> = {
  brand: "bg-brand",
  green: "bg-[#2fd07c]",
  amber: "bg-[#f0b428]",
  slate: "bg-muted",
};

export function StatCard({ label, value, icon: Icon, accent = "brand" }: StatCardProps) {
  return (
    <div className="card-interactive card relative flex items-center gap-4 overflow-hidden p-5">
      <span className={`absolute inset-y-0 left-0 w-1 ${barClass[accent]}`} />
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accentClass[accent]}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}
