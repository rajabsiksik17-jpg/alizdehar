import type { Locale } from "@/lib/i18n/config";
import { pick, getDictionary } from "@/lib/i18n/config";
import { href } from "@/lib/site";
import type { MenuItem, Service, SiteSettings } from "@/types";
import { LogoImage } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { BrandIcon, Icon } from "@/components/icon";

export function Footer({
  locale,
  settings,
  menu,
  services,
}: {
  locale: Locale;
  settings: SiteSettings;
  menu: MenuItem[];
  services: Service[];
}) {
  const dict = getDictionary(locale);
  const year = new Date().getFullYear();
  const socials = settings.social_links.filter((s) => s.enabled && s.url);
  const quickLinks = menu.filter((m) => m.children.length === 0);
  const hasContact = settings.phone || settings.email || settings.address;

  return (
    <footer className="bg-brand-950 text-white">
      <div className="mx-auto max-w-[var(--container-content)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <LogoImage src={settings.logo} alt={pick(settings.site_name, locale)} className="h-11 w-11 shrink-0 object-contain" />
              <div className="leading-tight">
                <p className="text-lg font-extrabold">{pick(settings.site_name, locale)}</p>
                <p className="mt-0.5 text-xs text-accent-400">{pick(settings.tagline, locale)}</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              {pick(settings.site_description, locale)}
            </p>
            {socials.length ? (
              <div className="mt-6 flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-accent-500 hover:text-brand-950"
                  >
                    <BrandIcon name={s.icon || s.platform} className="h-5 w-5" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">
              {dict.footer.services}
            </h3>
            <ul className="mt-5 space-y-3">
              {services.map((s) => (
                <li key={s.id}>
                  <a
                    href={href(locale, `/services/${s.slug}`)}
                    className="text-sm text-white/70 transition-colors hover:text-accent-400"
                  >
                    {pick(s.name, locale)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">
              {dict.footer.quickLinks}
            </h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((m) => (
                <li key={m.id}>
                  <a
                    href={href(locale, m.url || "/")}
                    className="text-sm text-white/70 transition-colors hover:text-accent-400"
                  >
                    {pick(m.label, locale)}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={href(locale, "/quote")}
                  className="text-sm text-white/70 transition-colors hover:text-accent-400"
                >
                  {dict.actions.requestQuote}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact + newsletter */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">
              {dict.footer.contact}
            </h3>
            {hasContact ? (
              <ul className="mt-5 space-y-3 text-sm text-white/70">
                {settings.phone ? (
                  <li className="flex items-start gap-3">
                    <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    <a href={`tel:${settings.phone}`} dir="ltr" className="hover:text-accent-400">
                      {settings.phone}
                    </a>
                  </li>
                ) : null}
                {settings.email ? (
                  <li className="flex items-start gap-3">
                    <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    <a href={`mailto:${settings.email}`} className="hover:text-accent-400">
                      {settings.email}
                    </a>
                  </li>
                ) : null}
                {settings.address ? (
                  <li className="flex items-start gap-3">
                    <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    <span>{pick(settings.address, locale)}</span>
                  </li>
                ) : null}
                {settings.working_hours ? (
                  <li className="flex items-start gap-3">
                    <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    <span>{pick(settings.working_hours, locale)}</span>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-white/50">
                {pick(
                  {
                    en: "Contact details will appear here once configured from the admin dashboard.",
                    ar: "ستظهر بيانات التواصل هنا بعد ضبطها من لوحة التحكم.",
                  },
                  locale,
                )}
              </p>
            )}
            <div className="mt-6">
              <NewsletterForm locale={locale} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[var(--container-content)] flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-white/50 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {year} {pick(settings.site_name, locale)}. {dict.footer.rights}
          </p>
          <div className="flex items-center gap-5">
            <a href={href(locale, "/privacy")} className="hover:text-accent-400">
              {dict.footer.privacy}
            </a>
            <a href={href(locale, "/terms")} className="hover:text-accent-400">
              {dict.footer.terms}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
