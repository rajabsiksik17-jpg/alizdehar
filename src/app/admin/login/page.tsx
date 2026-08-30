import { LoginForm } from "../login-form";
import { LogoMark } from "@/components/layout/logo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3">
          <LogoMark className="h-12 w-12" />
        </div>
        <h1 className="mt-6 text-center text-2xl font-bold text-brand-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-center text-sm text-ink-muted">
          Al-Izdehar Logistics
        </p>
        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
