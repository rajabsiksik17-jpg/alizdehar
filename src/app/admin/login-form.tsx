"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Phase = "credentials" | "otp";

export function LoginForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const configured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function onSubmitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Server-side brute-force gate before hitting Supabase Auth.
      const pre = await fetch("/api/admin/auth/pre-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (pre.status === 429) {
        const pj = await pre.json().catch(() => ({}));
        const secs = pj.retryAfterSeconds;
        setError(
          secs
            ? `Too many sign-in attempts. Try again in ${Math.max(1, Math.ceil(secs / 60))} minute(s).`
            : "Too many sign-in attempts. Please try again later.",
        );
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Invalid email or password."
            : error.message,
        );
        setLoading(false);
        return;
      }

      // Determine whether an OTP challenge is required (new device).
      const res = await fetch("/api/admin/auth/login-state", { method: "POST" });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.needsOtp === true) {
        setPhase("otp");
        setInfo("A verification code was sent to your email.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(json.error || "Unable to verify your session. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error && err.message ? err.message : "Unable to sign in. Please try again.",
      );
      setLoading(false);
    }
  }

  async function onSubmitOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(json.error || "Verification failed.");
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  if (phase === "otp") {
    return (
      <form onSubmit={onSubmitOtp} className="space-y-4">
        {info ? <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">{info}</p> : null}
        <p className="text-sm text-ink-muted">
          For your security, verify this sign-in from a new device.
        </p>
        <div>
          <label htmlFor="admin-otp" className="mb-1.5 block text-sm font-semibold text-brand-900">
            Verification code
          </label>
          <input
            id="admin-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-800 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
        <button
          type="button"
          onClick={() => setPhase("credentials")}
          className="w-full text-center text-sm font-semibold text-brand-700 hover:text-accent-600"
        >
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmitCredentials} className="space-y-4">
      {!configured ? (
        <p className="rounded-lg bg-accent-50 px-3 py-2 text-xs text-accent-900">
          Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
          in .env.local, then run supabase/schema.sql.
        </p>
      ) : null}
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-brand-900">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-brand-900">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-800 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
