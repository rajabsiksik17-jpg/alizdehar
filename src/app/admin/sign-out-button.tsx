"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
    >
      Sign out
    </button>
  );
}
