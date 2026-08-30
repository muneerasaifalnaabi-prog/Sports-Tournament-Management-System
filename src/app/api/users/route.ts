import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { withApiHandler } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  return withApiHandler(async () => {
    requireRole(await getSessionUser(), ["ADMIN", "ORGANIZER"]);
    const role = req.nextUrl.searchParams.get("role");

    const users = await prisma.user.findMany({
      where: role ? { role: role as never } : undefined,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users });
  });
}
