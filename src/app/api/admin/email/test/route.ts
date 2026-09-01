import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { testSmtpConnection } from "@/lib/email";

export async function POST() {
  const session = await getAdminUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await testSmtpConnection();
  return NextResponse.json(result);
}
