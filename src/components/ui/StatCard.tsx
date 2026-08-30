import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "brand" | "green" | "amber" | "slate";
}

const accentClass: Record<NonNullable<StatCardProps["accent"]>, string> = {
  brand: "bg-brand-light text-brand",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  slate: "bg-slate-100 text-slate-600",
};

export function StatCard({ label, value, icon: Icon, accent = "brand" }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accentClass[accent]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}
