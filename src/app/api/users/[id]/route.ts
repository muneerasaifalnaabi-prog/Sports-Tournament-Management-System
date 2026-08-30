import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { withApiHandler } from "@/lib/api-utils";

const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "ORGANIZER", "REFEREE", "TEAM_MANAGER"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    requireRole(await getSessionUser(), ["ADMIN"]);
    const body = updateUserSchema.parse(await req.json());

    const user = await prisma.user.update({
      where: { id },
      data: { role: body.role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user });
  });
}
