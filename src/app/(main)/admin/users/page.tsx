"use client";

import { useEffect, useState } from "react";
import { Users as UsersIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Select } from "@/components/ui/Input";
import { RoleBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Spinner";
import type { SessionUser } from "@/lib/session-context";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: SessionUser["role"];
}

const roles: SessionUser["role"][] = ["ADMIN", "ORGANIZER", "REFEREE", "TEAM_MANAGER"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[] | null>(null);

  const load = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users));
  };

  useEffect(load, []);

  const handleRoleChange = async (userId: string, role: string) => {
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted">Manage roles across the platform.</p>
      </div>

      <Card>
        {users === null ? (
          <TableSkeleton rows={6} cols={3} />
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
              </tr>
            </Thead>
            <tbody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td className="font-medium">{u.name}</Td>
                  <Td className="text-muted">{u.email}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={u.role} />
                      <Select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="w-40">
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Select>
                    </div>
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
