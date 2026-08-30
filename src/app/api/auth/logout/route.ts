import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { withApiHandler } from "@/lib/api-utils";

export async function POST() {
  return withApiHandler(async () => {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  });
}
