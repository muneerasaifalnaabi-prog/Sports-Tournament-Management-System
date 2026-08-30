import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { withApiHandler } from "@/lib/api-utils";

export async function GET() {
  return withApiHandler(async () => {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({
      user: {
        id: session.sub,
        name: session.name,
        email: session.email,
        role: session.role,
      },
    });
  });
}
