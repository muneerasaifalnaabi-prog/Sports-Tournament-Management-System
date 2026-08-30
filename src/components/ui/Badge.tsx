import type { MatchStatus, Role } from "@prisma/client";

const statusLabel: Record<MatchStatus, string> = {
  SCHEDULED: "Scheduled",
  LIVE: "Live",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusClass: Record<MatchStatus, string> = {
  SCHEDULED: "badge-scheduled",
  LIVE: "badge-live",
  COMPLETED: "badge-completed",
  CANCELLED: "badge-cancelled",
};

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  return (
    <span className={`badge ${statusClass[status]}`}>
      {status === "LIVE" && <span className="live-dot" />}
      {statusLabel[status]}
    </span>
  );
}

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  ORGANIZER: "Organizer",
  REFEREE: "Referee",
  TEAM_MANAGER: "Team Manager",
};

export function RoleBadge({ role }: { role: Role }) {
  return <span className="badge badge-role">{roleLabel[role]}</span>;
}
