import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, getDictionary } from "@/lib/i18n/config";
import { getSettings } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { resolvePageBackground } from "@/lib/page-background";
import { Section } from "@/components/sections";
import { PageHero } from "@/components/page-hero";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { ContactForm } from "@/components/forms/contact-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  return buildMetadata({
    locale,
    path: "/contact",
    title: { en: "Contact Us", ar: "اتصل بنا" },
    description: {
      en: "Get in touch with Al-Izdehar Logistics for sea, air and land freight, customs clearance and integrated logistics solutions.",
      ar: "تواصل مع الإزدهار للوجستيات للشحن البحري والجوي والبري والتخليص الجمركي والحلول اللوجستية المتكاملة.",
    },
  });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const settings = await getSettings();
  const dict = getDictionary(lang);
  const hasInfo = settings.phone || settings.email || settings.address || settings.working_hours;
  const background = await resolvePageBackground("contact");

  return (
    <>
      <PageHero
        title={dict.nav.contact}
        subtitle={pick(
          {
            en: "We are here to help with your logistics and shipping needs.",
            ar: "نحن هنا لمساعدتك في احتياجاتك اللوجستية والشحن.",
          },
          lang,
        )}
        background={background}
      />

      <Breadcrumbs locale={lang} items={[{ name: dict.nav.contact }]} />

      <Section bg="muted">
        <div className="grid gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-soft">
              <h2 className="text-xl font-bold text-brand-900">{dict.common.getInTouch}</h2>
              {hasInfo ? (
                <ul className="mt-6 space-y-5 text-sm text-ink-muted">
                  {settings.phone ? (
                    <li className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <Icon name="phone" className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-brand-900">{pick({ en: "Phone", ar: "الهاتف" }, lang)}</p>
                        <a href={`tel:${settings.phone}`} dir="ltr" className="hover:text-accent-600">{settings.phone}</a>
                      </div>
                    </li>
                  ) : null}
                  {settings.email ? (
                    <li className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <Icon name="mail" className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-brand-900">{pick({ en: "Email", ar: "البريد الإلكتروني" }, lang)}</p>
                        <a href={`mailto:${settings.email}`} className="hover:text-accent-600">{settings.email}</a>
                      </div>
                    </li>
                  ) : null}
                  {settings.address ? (
                    <li className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <Icon name="map-pin" className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-brand-900">{pick({ en: "Address", ar: "العنوان" }, lang)}</p>
                        <p>{pick(settings.address, lang)}</p>
                      </div>
                    </li>
                  ) : null}
                  {settings.working_hours ? (
                    <li className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <Icon name="clock" className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-brand-900">{pick({ en: "Working Hours", ar: "ساعات العمل" }, lang)}</p>
                        <p>{pick(settings.working_hours, lang)}</p>
                      </div>
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p className="mt-6 text-sm text-ink-muted">
                  {pick(
                    {
                      en: "Contact details will appear here once configured from the admin dashboard.",
                      ar: "ستظهر بيانات التواصل هنا بعد ضبطها من لوحة التحكم.",
                    },
                    lang,
                  )}
                </p>
              )}

              <div className="mt-8 rounded-xl bg-brand-800 p-5 text-white">
                <p className="text-sm font-bold">{dict.actions.getQuote}</p>
                <a
                  href={`/${lang}/quote`}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-brand-950 transition-colors hover:bg-accent-400"
                >
                  {dict.actions.requestQuote}
                  <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-3">
            <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-soft">
              <h2 className="text-xl font-bold text-brand-900">
                {pick({ en: "Send us a message", ar: "أرسل لنا رسالة" }, lang)}
              </h2>
              <div className="mt-6">
                <ContactForm locale={lang} />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {settings.map_embed ? (
        <Section bg="white" className="!py-0">
          <div
            className="overflow-hidden rounded-2xl shadow-soft"
            dangerouslySetInnerHTML={{ __html: settings.map_embed }}
          />
        </Section>
      ) : null}
    </>
  );
}
