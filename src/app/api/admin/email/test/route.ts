import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/admin-auth";
import { testSmtpConnection } from "@/lib/email";

export async function POST() {
  const denied = await requireApiPermission("settings");
  if (denied) return denied;

  const result = await testSmtpConnection();
  return NextResponse.json(result);
}
