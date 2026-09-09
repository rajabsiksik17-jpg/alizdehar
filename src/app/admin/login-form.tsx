"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Phase = "credentials" | "otp";

function detectLocale(): string {
  if (typeof navigator === "undefined") return "en";
  const langs = (navigator.languages?.length ? navigator.languages : [navigator.language]) as string[];
  for (const l of langs) {
    if (l.toLowerCase().startsWith("ar")) return "ar";
    if (l.toLowerCase().startsWith("en")) return "en";
  }
  return navigator.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function LoginForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(0);
  const [locale] = useState(detectLocale());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const configured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const resendWaitSeconds = 30;
  const canResend = now >= resendAt;

  // If the user is already authenticated but not yet trusted (e.g. redirected
  // here by the server-side trust gate), resume the OTP flow automatically.
  useEffect(() => {
    if (!configured) return;
    const id = requestAnimationFrame(async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const ok = await requestOtp();
          if (ok) {
            setPhase("otp");
            setInfo("A verification code was sent to your email.");
            setResendAt(Date.now() + resendWaitSeconds * 1000);
          }
        }
      } catch {
        // ignore
      }
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestOtp(): Promise<boolean> {
    const res = await fetch("/api/admin/auth/login-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.needsOtp === true) {
      return true;
    }
    if (res.ok && json.needsOtp === false) {
      // Already trusted — proceed straight to admin.
      router.push("/admin");
      router.refresh();
      return false;
    }
    setError(json.error || (json.error ?? "Unable to send the verification code."));
    return false;
  }

  async function onSubmitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
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
          error.message === "Invalid login credentials" ? "Invalid email or password." : error.message,
        );
        setLoading(false);
        return;
      }

      const ok = await requestOtp();
      if (ok) {
        setPhase("otp");
        setInfo("A verification code was sent to your email.");
        setResendAt(Date.now() + resendWaitSeconds * 1000);
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Unable to sign in. Please try again.");
    } finally {
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
        body: JSON.stringify({ code, locale }),
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

  async function onResend() {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const ok = await requestOtp();
      if (ok) {
        setInfo("A new verification code was sent to your email.");
        setResendAt(Date.now() + resendWaitSeconds * 1000);
      }
    } finally {
      setLoading(false);
    }
  }

  if (phase === "otp") {
    const wait = Math.max(0, Math.ceil((resendAt - now) / 1000));
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
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPhase("credentials")}
            className="text-sm font-semibold text-brand-700 hover:text-accent-600"
          >
            Back to sign in
          </button>
          <button
            type="button"
            onClick={onResend}
            disabled={!canResend || loading}
            className="text-sm font-semibold text-brand-700 hover:text-accent-600 disabled:opacity-50"
          >
            {canResend ? "Resend code" : `Resend in ${wait}s`}
          </button>
        </div>
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
