import { cookies } from "next/headers";
import { isLocale, getDictionary } from "@/lib/i18n/config";
import { href } from "@/lib/site";
import { Icon } from "@/components/icon";

export default async function NotFound() {
  const store = await cookies();
  const raw = store.get("NEXT_LOCALE")?.value;
  const locale = isLocale(raw) ? raw : "en";
  const dict = getDictionary(locale);

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-brand-950 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#fff" strokeWidth="1">
            <circle cx="600" cy="300" r="220" />
            <circle cx="600" cy="300" r="140" />
            <path d="M0 300H1200M600 0V600" />
          </g>
        </svg>
      </div>
      <div className="relative mx-auto max-w-[var(--container-content)] px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-7xl font-extrabold text-accent-500 md:text-8xl">404</p>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          {dict.notFound.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/70">{dict.notFound.description}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <a
            href={href(locale, "/")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-semibold text-brand-950 transition-colors hover:bg-accent-400"
          >
            <Icon name="arrow-left" className="h-4 w-4 rtl:rotate-180" />
            {dict.notFound.cta}
          </a>
          <a
            href={href(locale, "/services")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {dict.actions.viewServices}
          </a>
          <a
            href={href(locale, "/contact")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {dict.actions.contactUs}
          </a>
        </div>
      </div>
    </section>
  );
}
