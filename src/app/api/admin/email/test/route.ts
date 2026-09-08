import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/admin-auth";
import { testSmtpConnection, testImapConnection } from "@/lib/email";

export async function POST(req: Request) {
  const denied = await requireApiPermission("settings");
  if (denied) return denied;

  let body: { type?: string } = {};
  try {
    body = await req.json();
  } catch {
    // default to smtp
  }

  if (body.type === "imap") {
    const result = await testImapConnection();
    return NextResponse.json(result);
  }

  const result = await testSmtpConnection();
  return NextResponse.json(result);
}
